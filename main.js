const panels = document.querySelectorAll(".panel");
panels.forEach(panel => {
    const navbarHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));
    const panelHeight = 670;
    const top = panel.dataset.index * (panelHeight) + navbarHeight;
    panel.style.height = panelHeight + 'px';
    panel.style.top = top + 'px';
})

// const projects = document.querySelectorAll('.project');
// projects.forEach(project => {
//     const top = project.dataset.index * (400) + 100;
//     project.style.top = top + 'px';

// })