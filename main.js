const panels = document.querySelectorAll(".panel");
panels.forEach(panel => {
    const navbarHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));
    const panelHeight = 670;
    const top = panel.dataset.index * (panelHeight) + navbarHeight;
    panel.style.height = panelHeight + 'px';
    panel.style.top = top + 'px';
});

function menuClick() {
    const panel = document.querySelector(`#${this.innerText}`);
    const top = parseInt(panel.style.top);
    scrollTo(0, top - 80);
};

const menu = document.querySelectorAll(".menu-item");
menu.forEach(item => {
    item.addEventListener('click', menuClick);
});