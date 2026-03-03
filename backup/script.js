// ===== 導航欄滾動效果 =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // 更新導航欄活動狀態
    updateActiveNav();
});

// ===== 移動端選單切換 =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// 點擊導航連結後關閉選單
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== 平滑滾動 =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 更新導航欄活動狀態 =====
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===== 作品篩選功能 =====
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // 移除所有按鈕的 active 類
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // 添加 active 類到當前按鈕
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            if (filterValue === 'all') {
                item.classList.remove('hide');
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 100);
            } else {
                if (item.getAttribute('data-category') === filterValue) {
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
            }
        });
    });
});

// ===== 返回頂部按鈕 =====
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== 表單提交處理 =====
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 獲取表單數據
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;

    // 這裡可以添加實際的表單提交邏輯（例如發送到後端 API）
    console.log('表單數據：', { name, phone, email, service, message });

    // 顯示成功訊息
    alert('感謝您的諮詢！我們會盡快與您聯繫。');

    // 清空表單
    contactForm.reset();
});

// ===== 滾動動畫 =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// 為需要動畫的元素添加觀察
const animatedElements = document.querySelectorAll(
    '.service-card, .news-card, .portfolio-item, .stat-item, .about-text, .about-image'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== 統計數字動畫 =====
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

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const statNumbers = entry.target.querySelectorAll('.stat-item h4');
            statNumbers.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
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

// ===== 作品集項目點擊放大效果 =====
portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        const title = item.querySelector('h3').textContent;
        const description = item.querySelector('p').textContent;

        // 創建模態框
        const modal = document.createElement('div');
        modal.className = 'portfolio-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img src="${imgSrc}" alt="${title}">
                <div class="modal-info">
                    <h3>${title}</h3>
                    <p>${description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // 添加模態框樣式
        const style = document.createElement('style');
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

        // 關閉模態框
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            }
        });
    });
});

// ===== 新聞卡片懸停效果增強 =====
const newsCards = document.querySelectorAll('.news-card');
newsCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// ===== 頁面載入動畫 =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});