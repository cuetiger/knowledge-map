const SearchEngine = {
    index: null,

    init() {
        this.buildIndex();
        this.bindEvents();
    },

    buildIndex() {
        const docs = [];
        Object.entries(KNOWLEDGE_DATA.articles).forEach(([path, article]) => {
            const plainText = article.content.replace(/```[\s\S]*?```/g, '')
                                              .replace(/`[^`]+`/g, '')
                                              .replace(/[#*\[\]]/g, ' ')
                                              .replace(/\s+/g, ' ')
                                              .trim();
            docs.push({
                path: path,
                title: article.title,
                section: article.section || '',
                content: plainText
            });
        });
        this.documents = docs;
    },

    bindEvents() {
        const input = document.getElementById('searchInput');
        const resultsBox = document.getElementById('searchResults');

        input.addEventListener('input', () => this.onInput(input.value));
        input.addEventListener('focus', () => {
            if (input.value.trim()) resultsBox.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#searchBox')) {
                resultsBox.classList.remove('active');
            }
        });
    },

    onInput(query) {
        const resultsBox = document.getElementById('searchResults');

        if (!query.trim()) {
            resultsBox.classList.remove('active');
            return;
        }

        const results = this.search(query.trim());
        this.renderResults(results, query.trim());
        resultsBox.classList.add('active');
    },

    search(query) {
        const q = query.toLowerCase();
        const results = [];

        this.documents.forEach(doc => {
            let score = 0;
            const matches = [];

            if (doc.title.toLowerCase().includes(q)) {
                score += 100;
                matches.push(doc.title);
            }

            if (doc.section.toLowerCase().includes(q)) {
                score += 30;
            }

            const contentLower = doc.content.toLowerCase();
            const idx = contentLower.indexOf(q);
            if (idx >= 0) {
                score += 20;
                const start = Math.max(0, idx - 40);
                const end = Math.min(doc.content.length, idx + q.length + 60);
                matches.push((start > 0 ? '...' : '') + doc.content.slice(start, end) + (end < doc.content.length ? '...' : ''));
            }

            if (score > 0) {
                results.push({ ...doc, score, matches });
            }
        });

        results.sort((a, b) => b.score - a.score);
        return results.slice(0, 12);
    },

    renderResults(results, query) {
        const container = document.getElementById('searchResults');

        if (results.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding:24px;">
                <div class="empty-state-text">未找到 "${escapeHtml(query)}" 相关内容</div>
            </div>`;
            return;
        }

        container.innerHTML = results.map(r => {
            const snippet = r.matches.find(m => m.includes(query)) || r.content.slice(0, 80);
            const highlighted = this.highlightMatch(snippet, query);
            return `<div class="search-result-item" onclick="navigateTo('${r.path}');document.getElementById('searchResults').classList.remove('active');">
                <div class="search-result-title">${escapeHtml(r.title)}</div>
                <div class="search-result-path">${r.section} / ${escapeHtml(r.title)}</div>
                ${highlighted ? `<div class="search-result-match">${highlighted}</div>` : ''}
            </div>`;
        }).join('');
    },

    highlightMatch(text, query) {
        if (!text) return '';
        const escaped = escapeHtml(query);
        const re = new RegExp(`(${escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(re, '<mark>$1</mark>');
    }
};
