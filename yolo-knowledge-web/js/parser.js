var MarkdownParser = {

    init: function() {
        if (typeof marked === 'undefined') {
            console.error('[MD] marked.js not loaded');
            return false;
        }

        console.log('[MD] Parser ready (marked ' + (marked.version || '?') + ')');
        return true;
    },

    _highlight: function(code, lang) {
        try {
            if (typeof hljs !== 'undefined') {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            }
        } catch(e) {}
        return this._esc(code);
    },

    _esc: function(s) {
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    },

    parse: function(md) {
        var html;

        try {
            html = marked.parse(md);
        } catch(e) {
            console.error('[MD] Parse error:', e.message, e.stack);
            return '<div style="padding:20px;background:#1e293b;border-radius:8px;border-left:4px solid #ef4444;color:#fca5a5;">' +
                '<h3 style="color:#ef4444;margin-bottom:10px;font-size:15px;">Markdown 解析错误</h3>' +
                '<pre style="white-space:pre-wrap;font-size:13px;color:#fca5a5;background:transparent;padding:0;margin:0;border:none;">' + e.message + '</pre>' +
                '<details style="margin-top:12px;"><summary style="cursor:pointer;color:#fbbf24;font-size:13px;">查看原始内容</summary>' +
                '<pre style="white-space:pre-wrap;font-size:12px;color:#94a3b8;background:#0d1117;padding:12px;border-radius:6px;margin-top:8px;overflow:auto;max-height:400px;">' + this._esc(md.substring(0, 5000)) + '</pre></details></div>';
        }

        html = this._postProcess(html);
        return html;
    },

    _postProcess: function(html) {
        html = this._addHeadingIds(html);
        html = this._mermaidBlocks(html);
        html = this._enhanceCodeBlocks(html);
        html = this._wikiLinks(html);
        html = this._checkboxes(html);
        return html;
    },

    _addHeadingIds: function(html) {
        var self = this;
        var usedIds = {};
        return html.replace(/<h([2-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, function(match, level, attrs, text) {
            var rawText = text.replace(/<[^>]*>/g, '').trim();
            var slug = rawText
                .toLowerCase()
                .replace(/[\s#\-–—·]+/g, '-')
                .replace(/[^\w\u4e00-\u9fa5-]/g, '')
                .replace(/^-+|-+$/g, '')
                || ('heading-' + level);
            if (usedIds[slug]) {
                usedIds[slug]++;
                slug = slug + '-' + usedIds[slug];
            } else {
                usedIds[slug] = 1;
            }
            return '<h' + level + ' id="' + self._esc(slug) + '"' + attrs + '>' + text + '</h' + level + '>';
        });
    },

    _enhanceCodeBlocks: function(html) {
        var self = this;

        return html.replace(/<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g, function(match, cls, codeText) {
            var lang = 'text';
            if (cls) {
                var m = cls.match(/language-(\S+)/);
                if (m) lang = m[1];
            }

            var decoded = codeText
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

            var highlighted = self._highlight(decoded, lang);
            var cid = 'c' + Math.random().toString(36).slice(2, 10);

            return '<div class="code-block-wrapper">' +
                '<div class="code-header">' +
                    '<span class="code-lang">' + lang + '</span>' +
                    '<button class="copy-btn" data-copy-id="' + cid + '" onclick="copyCode(this)">复制</button>' +
                '</div>' +
                '<pre><code id="' + cid + '" class="hljs language-' + lang + '">' + highlighted + '</code></pre>' +
            '</div>';
        });
    },

    _wikiLinks: function(html) {
        return html.replace(/\[\[([^\]]+)\]\]/g, function(m, t) {
            var s = t.trim();
            return '<a href="#" onclick="handleWikiLink(\'' + s.replace(/'/g, "\\'") + '\');return false;" class="wiki-link">' + s + '</a>';
        });
    },

    _mermaidBlocks: function(html) {
        var idx = 0;
        var self = this;
        return html.replace(/<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g, function(match, cls, codeText) {
            if (!cls || cls.indexOf('language-mermaid') === -1) return match;

            var decoded = codeText
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .trim();

            decoded = self._fixMermaidLabels(decoded);
            decoded = decoded.replace(/<br\s*\/?>/gi, '\n');

            var id = 'mmd-' + (idx++);
            return '<div class="mermaid-container" id="' + id + '">' +
                '<div class="mermaid-loading"><div class="mermaid-spinner"></div>渲染图表中...</div>' +
                '<div class="mermaid-diagram" style="display:none;">' + self._esc(decoded) + '</div>' +
            '</div>';
        });
    },

    _fixMermaidLabels: function(code) {
        return code.replace(/(\w+)\[((?:[^\[\]]|\[(?:[^\[\]])*\])*)\]/g, function(fullMatch, nodeId, label) {
            var fixedLabel = label.replace(/"/g, '\\"').replace(/<br\s*\/?>/gi, '\n');
            return nodeId + '["' + fixedLabel + '"]';
        });
    },

    _checkboxes: function(html) {
        return html
            .replace(/<li>\[ \]/g, '<li><input type="checkbox" disabled class="task-list-item"> ')
            .replace(/<li>\[x\]/gi, '<li><input type="checkbox" checked disabled class="task-list-item"> ');
    },

    renderMermaidDiagrams: async function(container) {
        if (typeof mermaid === 'undefined') return;

        var diags = container.querySelectorAll('.mermaid-container');
        for (var i = 0; i < diags.length; i++) {
            var d = diags[i];
            var codeEl = d.querySelector('.mermaid-diagram');
            var loadEl = d.querySelector('.mermaid-loading');
            if (!codeEl) continue;

            try {
                var res = await mermaid.render(d.id + '-svg', codeEl.textContent);
                loadEl.style.display = 'none';
                var w = document.createElement('div');
                w.innerHTML = res.svg;
                w.style.cssText = 'display:flex;justify-content:center;';
                d.appendChild(w.firstChild);
            } catch(e) {
                loadEl.innerHTML = '<span style="color:#ef4444;">图表渲染失败: ' + e.message + '</span>';
            }
        }
    },

    extractTOC: function(html) {
        var toc = [];
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var hs = tmp.querySelectorAll('h2, h3');
        for (var i = 0; i < hs.length; i++) {
            toc.push({
                level: parseInt(hs[i].tagName.charAt(1)),
                text: hs[i].textContent.replace(/^[\s#]+/, ''),
                id: hs[i].id
            });
        }
        return toc;
    }
};

function copyCode(btn) {
    var el = document.getElementById(btn.getAttribute('data-copy-id'));
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(function() {
        btn.textContent = '已复制!';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
    });
}

function handleWikiLink(t) {
    navigateTo(t);
}
