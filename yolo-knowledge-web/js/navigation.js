const Navigation = {
    currentPage: 'home',
    flatNavList: [],

    init() {
        this.buildFlatList();
        this.renderSidebar();
        this.bindEvents();
        this.restoreSidebarState();
    },

    buildFlatList() {
        this.flatNavList = [];
        KNOWLEDGE_DATA.navigation.forEach(section => {
            if (section.isHome) {
                this.flatNavList.push({ ...section, sectionTitle: '' });
            } else if (section.children) {
                section.children.forEach(child => {
                    this.flatNavList.push({ ...child, sectionTitle: section.title });
                });
            }
        });
    },

    renderSidebar() {
        const nav = document.getElementById('sidebarNav');
        let html = '';

        KNOWLEDGE_DATA.navigation.forEach(section => {
            if (section.isHome) {
                html += `<div class="nav-section">
                    <a class="nav-item ${this.currentPage === 'home' ? 'active' : ''}"
                       onclick="navigateTo('home')" data-path="home">
                        🏠 首页
                    </a>
                </div>`;
            } else {
                const isCollapsed = !this.isInSection(this.currentPage, section.id);
                html += `<div class="nav-section ${isCollapsed ? 'collapsed' : ''}">
                    <div class="nav-section-header" onclick="Navigation.toggleSection(this)">
                        <span class="nav-arrow">▾</span>
                        <span>${section.icon} ${section.title}</span>
                    </div>
                    <div class="nav-items">`;
                section.children.forEach(child => {
                    const isActive = this.currentPage === child.path;
                    html += `<a class="nav-item ${isActive ? 'active' : ''}"
                               onclick="navigateTo('${child.path}')"
                               data-path="${child.path}">${child.title}</a>`;
                });
                html += `</div></div>`;
            }
        });

        nav.innerHTML = html;
    },

    isInSection(currentPath, sectionId) {
        if (currentPath === 'home') return false;
        return currentPath.startsWith(sectionId);
    },

    toggleSection(header) {
        const section = header.closest('.nav-section');
        section.classList.toggle('collapsed');
    },

    setActive(path) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`.nav-item[data-path="${path}"]`);
        if (activeItem) activeItem.classList.add('active');

        document.querySelectorAll('.nav-section').forEach(sec => {
            const hasActive = sec.querySelector('.nav-item.active');
            if (hasActive) sec.classList.remove('collapsed');
        });
    },

    bindEvents() {
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleMobile());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeMobile());
    },

    toggleMobile() {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('active');
    },

    closeMobile() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const expandFab = document.getElementById('sidebarExpandFab');
        const isHidden = sidebar.classList.contains('hidden');

        if (isHidden) {
            sidebar.classList.remove('hidden');
            mainContent.classList.remove('expanded');
            expandFab.classList.remove('visible');
            localStorage.setItem('yolo-kb-sidebar', 'visible');
        } else {
            sidebar.classList.add('hidden');
            mainContent.classList.add('expanded');
            expandFab.classList.add('visible');
            localStorage.setItem('yolo-kb-sidebar', 'hidden');
            this.closeMobile();
        }
    },

    restoreSidebarState() {
        var saved = localStorage.getItem('yolo-kb-sidebar');
        if (saved === 'hidden') {
            document.getElementById('sidebar').classList.add('hidden');
            document.getElementById('mainContent').classList.add('expanded');
            document.getElementById('sidebarExpandFab').classList.add('visible');
        }
    },

    getPrevNext(currentPath) {
        const idx = this.flatNavList.findIndex(item => item.path === currentPath && item.path !== 'home');
        return {
            prev: idx > 0 ? this.flatNavList[idx - 1] : null,
            next: idx < this.flatNavList.length - 1 ? this.flatNavList[idx + 1] : null
        };
    }
};

function navigateTo(path) {
    Navigation.currentPage = path;
    Navigation.setActive(path);
    Navigation.closeMobile();
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (path === 'home') {
        showHomePage();
    } else {
        showArticlePage(path);
    }

    const url = new URL(window.location);
    url.hash = '#' + path;
    history.pushState(null, '', url);

    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').classList.remove('active');
}
