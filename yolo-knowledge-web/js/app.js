const App = {
    async init() {
        ThemeManager.init();
        MarkdownParser.init();

        await this.initMermaid();
        Navigation.init();
        SearchEngine.init();
        this.renderHomeCards();
        this.bindGlobalEvents();
        this.initResizeHandle();
        this.handleInitialRoute();
    },

    async initMermaid() {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
                primaryColor: '#00ff88',
                primaryTextColor: '#f1f5f9',
                primaryBorderColor: '#1e293b',
                lineColor: '#64748b',
                secondaryColor: '#111827',
                tertiaryColor: '#1e293b',
                background: '#111827',
                mainBkg: '#111827',
                nodeBorder: '#2d3a4f',
                clusterBkg: 'rgba(0,255,136,0.04)',
                titleColor: '#f1f5f9',
                edgeLabelBackground: '#111827'
            },
            flowchart: { curve: 'basis', padding: 15, nodeSpacing: 40, rankSpacing: 50, useMaxWidth: true }
        });
    },

    renderHomeCards() {
        const container = document.getElementById('sectionCards');
        let html = '';

        KNOWLEDGE_DATA.navigation.forEach(section => {
            if (section.isHome) return;
            html += `<div class="section-card" onclick="navigateTo('${section.children[0].path}')">
                <div class="section-card-icon">${section.icon}</div>
                <div class="section-card-title">${section.title}</div>
                <div class="section-card-desc">${this.getSectionDesc(section.id)}</div>
                <div class="section-card-count">${section.children.length} 篇文章</div>
            </div>`;
        });

        container.innerHTML = html;
    },

    getSectionDesc(id) {
        const descs = {
            '01-YOLO基础概念': '目标检测基础原理、YOLO系列演进历史与YOLOv8架构深度解析',
            '02-Ultralytics框架入门': '环境搭建、快速上手、核心API使用与配置文件详解',
            '03-实战应用': '数据集准备、标注工具、格式转换与模型训练完整流程',
            '05-性能优化': '推理加速（TensorRT/ONNX）、模型压缩与训练性能优化策略',
            '07-资源与参考': '系统化学习路线图与YOLO领域核心论文推荐列表'
        };
        return descs[id] || '';
    },

    bindGlobalEvents() {
        window.addEventListener('scroll', () => this.onScroll());

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch(e.key.toLowerCase()) {
                case '/':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;
                case 'j':
                    e.preventDefault();
                    this.navigateRelative(1);
                    break;
                case 'k':
                    e.preventDefault();
                    this.navigateRelative(-1);
                    break;
                case 't':
                    ThemeManager.toggle();
                    break;
                case '[':
                    Navigation.toggleSidebar();
                    break;
                case '?':
                    toggleShortcuts();
                    break;
                case 'escape':
                    document.getElementById('searchResults').classList.remove('active');
                    document.getElementById('shortcutsModal').classList.remove('active');
                    break;
            }
        });
    },

    handleInitialRoute() {
        const hash = window.location.hash.slice(1);
        if (hash && hash !== 'home' && KNOWLEDGE_DATA.articles[hash]) {
            navigateTo(hash);
        } else {
            showHomePage();
        }
    },

    onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        document.getElementById('progressBar').style.width = progress + '%';

        const backToTop = document.getElementById('backToTop');
        if (scrollTop > 400) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        this.updateTOCActive();
    },

    updateTOCActive() {
        const headings = document.querySelectorAll('.article-body h2, .article-body h3');
        if (!headings.length) return;

        let currentId = '';
        const buffer = 100;

        headings.forEach(h => {
            const rect = h.getBoundingClientRect();
            if (rect.top <= buffer) currentId = h.id;
        });

        document.querySelectorAll('.toc-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-target') === currentId);
        });
    },

    navigateRelative(direction) {
        const { prev, next } = Navigation.getPrevNext(Navigation.currentPage);
        const target = direction > 0 ? next : prev;
        if (target) navigateTo(target.path);
    }
};

function showHomePage() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('articleContainer').style.display = 'none';
}

async function showArticlePage(path) {
    var article = KNOWLEDGE_DATA.articles[path];
    if (!article) {
        showHomePage();
        return;
    }

    document.getElementById('homePage').style.display = 'none';
    var container = document.getElementById('articleContainer');
    var page = document.getElementById('articlePage');
    container.style.display = 'flex';
    page.classList.remove('page-enter');
    void page.offsetWidth;
    page.classList.add('page-enter');

    document.getElementById('breadcrumb').innerHTML =
        '<a href="#" onclick="navigateTo(\'home\')">首页</a> › ' + (article.section || '');

    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleMeta').innerHTML =
        '<span>' + (article.section || '') + '</span><span>' + (article.date || '2026-04-14') + '</span>';

    var bodyEl = document.getElementById('articleBody');

    var renderContent = '';

    try {
        if (typeof MarkdownParser === 'undefined' || typeof MarkdownParser.parse !== 'function') {
            throw new Error('MarkdownParser not initialized');
        }

        if (typeof marked === 'undefined') {
            throw new Error('marked.js not loaded');
        }

        renderContent = MarkdownParser.parse(article.content);

        if (!renderContent || typeof renderContent !== 'string') {
            throw new Error('parse returned non-string: ' + typeof renderContent);
        }
    } catch (parseErr) {
        console.error('Article render error:', parseErr.message, parseErr.stack);
        renderContent = '<div style="padding:20px;background:#1e293b;border-radius:8px;border-left:4px solid #ef4444;color:#f87171;">' +
            '<h3 style="color:#ef4444;margin-bottom:10px;">⚠️ 渲染错误</h3>' +
            '<pre style="white-space:pre-wrap;font-size:13px;color:#fca5a5;">' +
            'Error: ' + parseErr.message + '\n\n' +
            '--- 原始内容预览 ---\n\n' +
            (article.content ? article.content.substring(0, 3000) : '(empty)') +
            (article.content && article.content.length > 3000 ? '\n\n... (共 ' + article.content.length + ' 字符，已截断)' : '') +
            '</pre></div>';
    }

    bodyEl.innerHTML = '<div class="rendered-content">' + renderContent + '</div>';

    try {
        await MarkdownParser.renderMermaidDiagrams(bodyEl);
    } catch (mermaidErr) {
        console.warn('Mermaid render error:', mermaidErr);
    }

    try {
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(bodyEl, {
                delimiters: [
                    { left: '$$', display: true, right: '$$' },
                    { left: '$', display: false, right: '$' }
                ],
                throwOnError: false
            });
        }
    } catch (mathErr) {
        console.warn('Math render error:', mathErr);
    }

    try {
        renderTOC(bodyEl);
    } catch (tocErr) {
        console.warn('TOC error:', tocErr);
    }

    try {
        renderArticleNav(path);
    } catch (navErr) {
        console.warn('Nav error:', navErr);
    }
}

function renderTOC(container) {
    const tocNav = document.getElementById('tocNav');
    const tocSidebar = document.getElementById('tocSidebar');
    const tocItems = MarkdownParser.extractTOC(container.innerHTML);

    if (tocItems.length < 2) {
        tocSidebar.style.display = 'none';
        return;
    }

    tocSidebar.style.display = 'block';
    tocNav.innerHTML = tocItems.map(item =>
        `<a class="toc-item toc-h${item.level}" href="#${item.id}"
           data-target="${item.id}"
           onclick="App.scrollToHeading('${item.id}');return false;">
           ${item.text}
         </a>`
    ).join('');
}

App.scrollToHeading = function(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({ top: top, behavior: 'smooth' });

    document.querySelectorAll('.toc-item').forEach(item => item.classList.remove('active'));
    const targetLink = document.querySelector(`.toc-item[data-target="${id}"]`);
    if (targetLink) targetLink.classList.add('active');

    el.classList.add('heading-highlight');
    setTimeout(() => el.classList.remove('heading-highlight'), 2000);
};

App.initResizeHandle = function() {
    var handle = document.getElementById('resizeHandle');
    if (!handle) return;

    var container = document.getElementById('articleContainer');
    var sidebar = document.getElementById('tocSidebar');
    var isDragging = false;
    var startX = 0;
    var startWidth = 0;

    handle.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        handle.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var delta = startX - e.clientX;
        var newWidth = Math.max(140, Math.min(400, startWidth + delta));
        sidebar.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        isDragging = false;
        handle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
};

function renderArticleNav(currentPath) {
    const nav = document.getElementById('articleNav');
    const { prev, next } = Navigation.getPrevNext(currentPath);

    nav.innerHTML = `
        ${prev ? `<a class="article-nav-link" onclick="navigateTo('${prev.path}')">
            <span class="article-nav-label">← 上一篇</span>
            <span class="article-nav-title">${prev.title}</span>
        </a>` : '<div></div>'}
        ${next ? `<a class="article-nav-link" style="text-align:right" onclick="navigateTo('${next.path}')">
            <span class="article-nav-label">下一篇 →</span>
            <span class="article-nav-title">${next.title}</span>
        </a>` : '<div></div>'}
    `;
}

function toggleShortcuts() {
    document.getElementById('shortcutsModal').classList.toggle('active');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.addEventListener('DOMContentLoaded', () => App.init());
