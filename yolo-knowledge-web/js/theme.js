const ThemeManager = {
    currentTheme: 'dark',

    init() {
        const saved = localStorage.getItem('yolo-kb-theme');
        if (saved) this.currentTheme = saved;
        this.apply();
        this.bindEvents();
    },

    apply() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('yolo-kb-theme', this.currentTheme);
    },

    toggle() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.apply();
    },

    bindEvents() {
        document.getElementById('themeToggle').addEventListener('click', () => this.toggle());
    }
};
