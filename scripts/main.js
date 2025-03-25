// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const closeMenu = document.getElementById('close-menu');
    const overlay = document.getElementById('overlay');

    if (menuToggle && mobileNav && closeMenu && overlay) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.remove('translate-x-full');
            overlay.classList.remove('hidden');
        });

        closeMenu.addEventListener('click', () => {
            mobileNav.classList.add('translate-x-full');
            overlay.classList.add('hidden');
        });

        overlay.addEventListener('click', () => {
            mobileNav.classList.add('translate-x-full');
            overlay.classList.add('hidden');
        });
    }

    // Hero section carousel functionality
    const indicators = document.querySelectorAll('.indicator-dot');
    if (indicators.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            indicators[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % indicators.length;
            indicators[currentSlide].classList.add('active');
        }, 5000);
    }
});