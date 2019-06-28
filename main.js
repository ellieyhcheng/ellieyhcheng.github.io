const panels = document.querySelectorAll(".panel");
panels.forEach(panel => {
    const navbarHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));
    const panelHeight = window.innerHeight - navbarHeight;
    const top = panel.dataset.index * panelHeight + navbarHeight;
    panel.style.height = panelHeight + 'px';
    panel.style.top = top + 'px';
})