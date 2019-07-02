const panels = document.querySelectorAll(".panel");
panels.forEach(panel => {
    const navbarHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));
    const panelHeight = 670;
    const top = panel.dataset.index * (panelHeight) + navbarHeight;
    panel.style.height = panelHeight + 'px';
    panel.style.top = top + 'px';
});

function updateMenu() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    panels.forEach(panel => {
        const top = parseInt(panel.style.top);
        if (y - top <= 335 && y - top >= -335) {
            const menu = document.querySelectorAll(".menu-item");
            menu.forEach(item => {
                if (panel.id.includes(item.innerText)) {
                    item.classList.add('menu-selected')
                }
            })
        } else {
            const menu = document.querySelectorAll(".menu-item");
            menu.forEach(item => {
                if (item.innerText === panel.id) {
                    item.classList.remove('menu-selected')
                }
            })
        }
    });
}

updateMenu();

document.addEventListener('scroll', updateMenu);

function menuClick() {
    const panel = document.querySelector(`#${this.innerText}`);
    const top = parseInt(panel.style.top);
    scrollTo(0, top - 80);
};

const menu = document.querySelectorAll(".menu-item");
menu.forEach(item => {
    item.addEventListener('click', menuClick);
});

function projectHover() {
    const projectCover = this.children[0];
    const projectFile = this.children[1];
    const projectImg = projectCover.children[0];
    projectCover.style.filter = 'grayscale(100%)';
    projectCover.style.opacity = '0.6';
    projectCover.style.zIndex = 0;
    projectImg.style.boxShadow = '0px 0px 0px 0px rgba(0,0,0,0)';
    projectCover.style.animation = 'coverHover 0.8s cubic-bezier(0,.99,.72,.98) 0s 1 alternate';

    projectFile.style.zIndex = 5;
    projectFile.style.opacity = '1';
    projectFile.style.boxShadow = '-2px -2px 10px 0px rgba(0,0,0,0.4)';
    projectFile.style.animation = 'fileHover 0.8s cubic-bezier(0,.99,.72,.98) 0s 1 alternate';
}

function projectLeave() {
    const projectCover = this.children[0];
    const projectFile = this.children[1];
    const projectImg = projectCover.children[0];
    projectCover.style.filter = 'grayscale(0)';
    projectCover.style.opacity = '1';
    projectCover.style.zIndex = 5;
    projectImg.style.boxShadow = '5px 5px 10px 0px rgba(0,0,0,0.3)';
    projectCover.style.animation = 'coverLeave 0.8s cubic-bezier(0,.99,.72,.98) 0s 1 alternate';

    projectFile.style.zIndex = 0;
    projectFile.style.opacity = '0.8';
    projectFile.style.boxShadow = '0px 0px 0px 0px rgba(0,0,0,0)';
    projectFile.style.animation = 'fileLeave 0.8s cubic-bezier(0,.99,.72,.98) 0s 1 alternate';
}

const projectCovers = document.querySelectorAll('.project-cover');
const projectFiles = document.querySelectorAll('.project-file');
const projects = document.querySelectorAll('.project');
projects.forEach(project => {
    project.addEventListener('mouseover', projectHover);
    project.addEventListener('mouseleave', projectLeave);
});

function tabClick() {
    this.classList.add('tab-selected');
    const index = this.dataset.index;
    const contents = document.querySelectorAll('.tab-content');
    const contentArray = Array.from(contents);
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab != this)
            tab.classList.remove('tab-selected');
    });

    contents.forEach(content => {
        if (content.dataset.index === index)
            content.classList.add('content-selected');
        else {
            content.classList.remove('content-selected');
        }
    });

    const hl = document.querySelector('#tab-hl');
    hl.style.top = (index * 43) + 'px';

}

const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', tabClick);
})