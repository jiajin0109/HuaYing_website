async function injectComponent(targetId, componentPath) {
    const target = document.getElementById(targetId);
    if (!target) return;

    const response = await fetch(componentPath, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to load component: ${componentPath}`);
    }

    target.innerHTML = await response.text();
}

function setActiveNavByPage() {
    const page = document.body.dataset.page;
    if (!page) return;

    const currentLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (currentLink) currentLink.classList.add('active');
}

function resolveContactLink() {
    const contactLink = document.querySelector('.nav-link[data-page="contact"]');
    if (!contactLink) return;

    if (document.getElementById('contact')) {
        contactLink.setAttribute('href', '#contact');
    } else {
        contactLink.setAttribute('href', 'about.html#contact');
    }
}

async function bootstrapLayout() {
    try {
        await injectComponent('site-header', 'components/header.html');
        await injectComponent('site-bottom', 'components/contact-footer.html');
        resolveContactLink();
        setActiveNavByPage();
    } catch (error) {
        console.error(error);
    }

    const appScript = document.createElement('script');
    appScript.src = 'script.js';
    document.body.appendChild(appScript);
}

bootstrapLayout();
