document.addEventListener("DOMContentLoaded", function() {
    updateMenu();
    document.addEventListener('scroll', updateMenu);
    const menu = document.querySelectorAll(".menu-item");
    menu.forEach(item => {
        item.addEventListener('click', menuClick);
    });
    const projectCovers = document.querySelectorAll('.project-cover');
    projectCovers.forEach(project => {
        project.addEventListener('mouseover', projectClick);
        project.parentElement.addEventListener('mouseleave', projectLeave);
    });
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', tabClick);
    })
});

const sections = Array.from(document.getElementById('panel-container').children);

function updateMenu() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    sections.forEach((section, i) => {
        var halfWindow = window.innerHeight / 2
        var error = section.scrollHeight - halfWindow;
        if (y - section.offsetTop < error && y - section.offsetTop >= -halfWindow) {
            const menu = document.querySelectorAll(".menu-item");
            menu.forEach(item => {
                if (section.id.includes(item.innerText)) {
                    item.classList.add('menu-selected')
                }
            })
        } else {
            const menu = document.querySelectorAll(".menu-item");
            menu.forEach(item => {
                if (item.innerText === section.id) {
                    item.classList.remove('menu-selected')
                }
            })
        }
    });
}

function menuClick() {
    const panel = document.querySelector(`#${this.innerText}`);
    const top = parseInt(panel.style.top);
    scrollTo(0, top - 80);
};

function projectClick() {
    setTimeout(() => {
        const project = this.parentElement;
        const projectCover = this;
        const projectFile = project.children[1];
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
    }, 200);

}

function projectLeave() {
    setTimeout(() => {
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
    }, 300);

}



function tabClick() {
    this.classList.add('tab-selected');
    const index = this.dataset.index;
    const contents = document.querySelectorAll('.tab-content');
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab != this)
            tab.classList.remove('tab-selected');
    });

    contents.forEach(content => {
        if (content.dataset.index === index) {
            content.style.opacity = 1;
            content.classList.add('content-selected');
        }
        else {
            content.style.opacity = 0;
            content.classList.remove('content-selected');
        }
    });

    const hl = document.querySelector('#tab-hl');
    hl.style.top = (index * 43) + 'px';

}

