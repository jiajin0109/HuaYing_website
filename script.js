const DATA_URL = 'assets/content.json';

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const hashNavLinks = Array.from(navLinks).filter((link) => {
    const href = link.getAttribute('href') || '';
    return href.startsWith('#');
});
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const backToTopButton = document.getElementById('back-to-top');
const contactForm = document.getElementById('contact-form');
const solidNav = document.body.classList.contains('solid-nav');

const newsGrid = document.getElementById('news-grid');
const servicesGrid = document.getElementById('services-grid');
const portfolioFilters = document.getElementById('portfolio-filters');
const portfolioGrid = document.getElementById('portfolio-grid');
const panoramaSection = document.getElementById('panorama');
const panoramaContainer = document.getElementById('panorama-viewer');
const panoramaControls = document.getElementById('panorama-scene-controls');
const panoramaNote = document.getElementById('panorama-note');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

let siteData = null;
let panoramaViewer = null;
let panoramaLoaded = false;

function updateActiveNav() {
    if (hashNavLinks.length === 0) return;

    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            hashNavLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

function applyEntranceAnimation(elements) {
    elements.forEach((el) => {
        if (el.dataset.observed === '1') return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
        el.dataset.observed = '1';
    });
}

function renderNews(newsItems) {
    if (!newsGrid) return;

    if (!Array.isArray(newsItems) || newsItems.length === 0) {
        newsGrid.innerHTML = '<p class="data-error">暫無最新消息資料</p>';
        return;
    }

    newsGrid.innerHTML = newsItems.map((item) => `
        <article class="news-card">
            <div class="news-image">
                <img src="${item.image}" alt="${item.alt || item.title}">
                <div class="news-date">${item.date || ''}</div>
            </div>
            <div class="news-content">
                <h3>${item.title || ''}</h3>
                <p>${item.excerpt || ''}</p>
                <a href="${item.link || '#'}" class="read-more">閱讀更多 →</a>
            </div>
        </article>
    `).join('');

    const newsCards = newsGrid.querySelectorAll('.news-card');
    newsCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    applyEntranceAnimation(newsCards);
}

function renderServices(serviceItems) {
    if (!servicesGrid) return;

    if (!Array.isArray(serviceItems) || serviceItems.length === 0) {
        servicesGrid.innerHTML = '<p class="data-error">目前尚無服務資料</p>';
        return;
    }

    servicesGrid.innerHTML = serviceItems.map((item) => `
        <div class="service-card">
            <div class="service-image">
                <img src="${item.image || ''}" alt="${item.alt || item.title || '服務項目'}">
            </div>
            <div class="service-content">
                <h3>${item.title || ''}</h3>
                <p>${item.description || ''}</p>
            </div>
        </div>
    `).join('');

    applyEntranceAnimation(servicesGrid.querySelectorAll('.service-card'));
    initializeServiceImageLightbox();
}

function renderPortfolio(portfolioData) {
    if (!portfolioFilters || !portfolioGrid) return;

    const categories = portfolioData?.categories || [];
    const items = (portfolioData?.items || []).map((item, sourceIndex) => ({ ...item, sourceIndex }));
    const getPortfolioImages = (item) => {
        if (Array.isArray(item?.images) && item.images.length > 0) {
            return item.images.filter(Boolean);
        }
        if (Array.isArray(item?.image) && item.image.length > 0) {
            return item.image.filter(Boolean);
        }
        if (typeof item?.images === 'string' && item.images) {
            return [item.images];
        }
        if (typeof item?.image === 'string' && item.image) {
            return [item.image];
        }
        return [];
    };
    const getOrderValue = (item) => {
        const order = Number(item.order);
        return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
    };

    if (categories.length === 0 || items.length === 0) {
        portfolioFilters.innerHTML = '<p class="data-error">作品資料不完整</p>';
        portfolioGrid.innerHTML = '<p class="data-error">暫無作品資料</p>';
        return;
    }

    portfolioFilters.innerHTML = categories.map((category, index) => `
        <button class="filter-btn ${index === 0 ? 'active' : ''}" data-filter="${category.id}">
            ${category.label}
        </button>
    `).join('');

    const sortedItems = [...items].sort((a, b) => {
        const orderDiff = getOrderValue(a) - getOrderValue(b);
        if (orderDiff !== 0) return orderDiff;
        return a.sourceIndex - b.sourceIndex;
    });

    portfolioGrid.innerHTML = sortedItems.map((item) => {
        const imageList = getPortfolioImages(item);
        const previewImage = imageList[0] || '';
        return `
        <div class="portfolio-item" data-category="${item.category}" data-source-index="${item.sourceIndex}">
            <img src="${previewImage}" alt="${item.alt || item.title}">
            <div class="portfolio-overlay">
                <h3>${item.title}</h3>
                <p>${item.meta || ''}</p>
            </div>
        </div>
    `;
    }).join('');

    const filterButtons = portfolioFilters.querySelectorAll('.filter-btn');
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.dataset.filter;
            const portfolioItems = portfolioGrid.querySelectorAll('.portfolio-item');

            portfolioItems.forEach((item) => {
                if (filterValue === 'all' || item.dataset.category === filterValue) {
                    item.classList.remove('hide');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.classList.add('hide');
                    }, 300);
                }
            });
        });
    });

    function openPortfolioModal(item) {
        const imageList = getPortfolioImages(item);

        if (imageList.length === 0) return;

        const title = item.title || '';
        const description = item.meta || '';
        let currentIndex = 0;

        const modal = document.createElement('div');
        modal.className = 'portfolio-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" role="button" aria-label="關閉">&times;</span>
                <button type="button" class="modal-nav prev" aria-label="上一張">&#10094;</button>
                <img src="${imageList[currentIndex]}" alt="${item.alt || title}" class="modal-image">
                <button type="button" class="modal-nav next" aria-label="下一張">&#10095;</button>
                <div class="modal-info">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <p class="modal-counter">${currentIndex + 1} / ${imageList.length}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const modalImage = modal.querySelector('.modal-image');
        const counter = modal.querySelector('.modal-counter');
        const prevButton = modal.querySelector('.modal-nav.prev');
        const nextButton = modal.querySelector('.modal-nav.next');
        const closeModal = modal.querySelector('.close-modal');

        function renderModalImage(index) {
            currentIndex = (index + imageList.length) % imageList.length;
            modalImage.src = imageList[currentIndex];
            counter.textContent = `${currentIndex + 1} / ${imageList.length}`;
        }

        function close() {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
            document.removeEventListener('keydown', onKeyDown);
        }

        function onKeyDown(e) {
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') renderModalImage(currentIndex - 1);
            if (e.key === 'ArrowRight') renderModalImage(currentIndex + 1);
        }

        if (imageList.length <= 1) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }

        prevButton.addEventListener('click', () => renderModalImage(currentIndex - 1));
        nextButton.addEventListener('click', () => renderModalImage(currentIndex + 1));
        closeModal.addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });
        document.addEventListener('keydown', onKeyDown);
    }

    portfolioGrid.addEventListener('click', (event) => {
        const card = event.target.closest('.portfolio-item');
        if (!card) return;

        const sourceIndex = Number(card.dataset.sourceIndex);
        const selectedItem = items.find((item) => item.sourceIndex === sourceIndex);
        if (!selectedItem) return;
        openPortfolioModal(selectedItem);
    });

    if (!document.getElementById('portfolio-modal-style')) {
        const style = document.createElement('style');
        style.id = 'portfolio-modal-style';
        style.textContent = `
            .portfolio-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            .modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                animation: zoomIn 0.3s ease;
            }
            .modal-content img {
                max-width: 100%;
                max-height: 80vh;
                border-radius: 10px;
            }
            .modal-nav {
                position: absolute;
                top: 45%;
                transform: translateY(-50%);
                width: 42px;
                height: 42px;
                border: none;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.55);
                color: #fff;
                font-size: 24px;
                cursor: pointer;
                z-index: 2;
            }
            .modal-nav.prev { left: 12px; }
            .modal-nav.next { right: 12px; }
            .modal-info {
                color: white;
                text-align: center;
                padding: 20px;
            }
            .modal-info h3 {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .close-modal {
                position: absolute;
                top: -40px;
                right: 0;
                font-size: 40px;
                color: white;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            .close-modal:hover {
                transform: rotate(90deg);
            }
            .modal-counter {
                margin-top: 6px;
                opacity: 0.8;
                font-size: 14px;
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes zoomIn {
                from { transform: scale(0.8); }
                to { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    applyEntranceAnimation(portfolioGrid.querySelectorAll('.portfolio-item'));
}

function setActivePanoramaScene(sceneId) {
    if (!panoramaControls) return;
    const sceneButtons = panoramaControls.querySelectorAll('.panorama-scene-btn');
    sceneButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.scene === sceneId);
    });
}

function showPanoramaFallback(message) {
    if (!panoramaContainer) return;
    panoramaContainer.innerHTML = `<div class="panorama-fallback">${message}</div>`;
}

function initPanoramaViewer() {
    if (panoramaLoaded || !panoramaContainer || !siteData?.panorama) return;

    if (typeof pannellum === 'undefined') {
        showPanoramaFallback('360 全景元件載入失敗，請稍後再試。');
        return;
    }

    const sceneIds = siteData.panorama.sceneOrder || Object.keys(siteData.panorama.scenes || {});
    if (sceneIds.length === 0) {
        showPanoramaFallback('未設定全景場景資料。');
        return;
    }

    const firstScene = siteData.panorama.firstScene || sceneIds[0];

    try {
        panoramaViewer = pannellum.viewer('panorama-viewer', {
            default: {
                firstScene,
                autoLoad: true,
                sceneFadeDuration: 900,
                showZoomCtrl: true,
                showFullscreenCtrl: true,
                mouseZoom: true,
                draggable: true,
                hfov: 110
            },
            scenes: siteData.panorama.scenes
        });

        panoramaViewer.on('scenechange', (sceneId) => {
            setActivePanoramaScene(sceneId);
        });

        setActivePanoramaScene(firstScene);
        panoramaLoaded = true;
    } catch (error) {
        console.error('Panorama init failed:', error);
        showPanoramaFallback('360 全景目前無法顯示，請確認 JSON 與全景圖路徑。');
    }
}

function renderPanorama(panoramaData) {
    if (!panoramaControls || !panoramaData) return;

    const sceneIds = panoramaData.sceneOrder || Object.keys(panoramaData.scenes || {});
    if (sceneIds.length === 0) {
        panoramaControls.innerHTML = '<p class="data-error">未設定場景資料</p>';
        return;
    }

    panoramaControls.innerHTML = sceneIds.map((sceneId, index) => {
        const title = panoramaData.scenes?.[sceneId]?.title || sceneId;
        return `<button class="panorama-scene-btn ${index === 0 ? 'active' : ''}" type="button" data-scene="${sceneId}">${title}</button>`;
    }).join('');

    if (panoramaNote && panoramaData.note) {
        panoramaNote.textContent = panoramaData.note;
    }

    panoramaControls.addEventListener('click', (event) => {
        const button = event.target.closest('.panorama-scene-btn');
        if (!button) return;

        const targetSceneId = button.dataset.scene;
        if (!panoramaData.scenes?.[targetSceneId]) return;

        if (!panoramaLoaded) {
            initPanoramaViewer();
        }

        if (!panoramaViewer) return;
        panoramaViewer.loadScene(targetSceneId);
        setActivePanoramaScene(targetSceneId);
    });
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (element.dataset.suffix || '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initializeServiceImageLightbox() {
    const serviceImages = document.querySelectorAll('.service-image img');
    if (serviceImages.length === 0) return;

    if (!document.getElementById('service-lightbox-style')) {
        const style = document.createElement('style');
        style.id = 'service-lightbox-style';
        style.textContent = `
            .service-lightbox {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.88);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 11000;
                padding: 20px;
            }
            .service-lightbox img {
                max-width: min(1200px, 92vw);
                max-height: 70vh;
                border-radius: 12px;
                box-shadow: 0 12px 48px rgba(0, 0, 0, 0.45);
            }
            .service-lightbox-close {
                position: absolute;
                top: 18px;
                right: 26px;
                font-size: 42px;
                color: #fff;
                cursor: pointer;
                line-height: 1;
            }
        `;
        document.head.appendChild(style);
    }

    serviceImages.forEach((img) => {
        img.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.className = 'service-lightbox';
            overlay.innerHTML = `
                <span class="service-lightbox-close" aria-label="關閉">&times;</span>
                <img src="${img.src}" alt="${img.alt || ''}">
            `;

            const close = () => {
                document.removeEventListener('keydown', onKeyDown);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                document.body.style.overflow = 'auto';
            };

            const onKeyDown = (e) => {
                if (e.key === 'Escape') close();
            };

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.classList.contains('service-lightbox-close')) {
                    close();
                }
            });

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', onKeyDown);
        });
    });
}

function initializeHomeSplash() {
    if (document.body?.dataset?.page !== 'home') return;
    const splash = document.getElementById('home-splash');
    if (!splash) return;

    const hideSplash = () => {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
        }, 1000);
    };

    setTimeout(hideSplash, 1200);
}

async function loadSiteData() {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status}`);
    }
    return response.json();
}

async function initializeDynamicSections() {
    try {
        siteData = await loadSiteData();
        renderServices(siteData.services);
        renderNews(siteData.news);
        renderPortfolio(siteData.portfolio);
        renderPanorama(siteData.panorama);

        if (panoramaSection && panoramaContainer) {
            const panoramaObserver = new IntersectionObserver((entries, panoObserver) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        initPanoramaViewer();
                        panoObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            panoramaObserver.observe(panoramaSection);
        }
    } catch (error) {
        console.error(error);
        if (newsGrid) newsGrid.innerHTML = '<p class="data-error">最新消息載入失敗</p>';
        if (portfolioFilters) portfolioFilters.innerHTML = '<p class="data-error">作品分類載入失敗</p>';
        if (portfolioGrid) portfolioGrid.innerHTML = '<p class="data-error">作品資料載入失敗</p>';
        if (panoramaControls) panoramaControls.innerHTML = '<p class="data-error">全景資料載入失敗</p>';
        showPanoramaFallback('全景資料載入失敗，請檢查 assets/content.json。');
    }
}

window.addEventListener('scroll', () => {
    if (solidNav || window.scrollY > 0) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    updateActiveNav();
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const targetSection = document.querySelector(targetId);
        if (!targetSection) return;

        e.preventDefault();
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');

        window.scrollTo({
            top: targetSection.offsetTop - 70,
            behavior: 'smooth'
        });
    });
});

if (backToTopButton) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const serviceField = document.getElementById('service');
        const service = serviceField ? serviceField.value : '';
        const message = document.getElementById('message').value;

        console.log('表單數據：', { name, phone, email, service, message });
        alert('感謝您的諮詢！我們會盡快與您聯繫。');
        contactForm.reset();
    });
}

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statNumbers = entry.target.querySelectorAll('.stat-item h4');
            statNumbers.forEach((stat) => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''), 10);
                const suffix = text.replace(/[0-9]/g, '');
                stat.dataset.suffix = suffix;
                animateValue(stat, 0, number, 2000);
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statObserver.observe(statsSection);
}

applyEntranceAnimation(document.querySelectorAll(
    '.service-card, .stat-item, .about-text, .about-image, .panorama-viewer-card'
));

if (solidNav && navbar) {
    navbar.classList.add('scrolled');
}

initializeHomeSplash();
initializeServiceImageLightbox();
initializeDynamicSections();
