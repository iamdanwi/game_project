import { AuthService } from './services/auth.js';
import { ErrorHandler } from './services/error-handler.js';

// Modal functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal && overlay) {
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('overlay');
    if (modal && overlay) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
    }
}

async function initializeModals() {
    try {
        // First, load the modal content
        const modalContainer = document.querySelector('[w3-include-html]');
        if (modalContainer) {
            const response = await fetch(modalContainer.getAttribute('w3-include-html'));
            const html = await response.text();
            modalContainer.innerHTML = html;
        }

        // Initialize cookie consent
        const acceptBtn = document.getElementById('accept-cookies');
        const customizeBtn = document.getElementById('customize-cookies');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'accepted');
                hideModal('cookie-modal');
            });
        }

        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => {
                console.log('Cookie customization clicked');
            });
        }

        // Check cookie consent
        if (!localStorage.getItem('cookieConsent')) {
            showModal('cookie-modal');
        }

        // Initialize auth modals
        initializeAuthModals();
    } catch (error) {
        ErrorHandler.handle(error, 'Modal Initialization');
    }
}

// Login modal functions
function switchTab(tab) {
    const phoneTab = document.querySelector('.login-tab:first-child');
    const accountTab = document.querySelector('.login-tab:last-child');
    const phoneForm = document.getElementById('phone-login-form');
    const accountForm = document.getElementById('account-login-form');

    if (tab === 'phone') {
        phoneTab.classList.add('active');
        accountTab.classList.remove('active');
        phoneForm.classList.remove('hidden');
        accountForm.classList.add('hidden');
    } else {
        accountTab.classList.add('active');
        phoneTab.classList.remove('active');
        accountForm.classList.remove('hidden');
        phoneForm.classList.add('hidden');
    }
}

function showRegister() {
    // Implement registration logic
    console.log('Register clicked');
}

function initializeAuthModals() {
    // Auth button handlers
    const loginBtn = document.querySelector('button#login-btn');
    const signupBtn = document.querySelector('button#signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const overlay = document.getElementById('overlay');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => showModal('login-modal'));
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => showModal('signup-modal'));
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            hideModal('login-modal');
            hideModal('signup-modal');
        });
    }

    // Form handlers
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Phone login form (if exists)
    const phoneLoginForm = document.getElementById('phone-login-form');
    if (phoneLoginForm) {
        phoneLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Phone login submitted');
        });
    }

    // Account login form (if exists)
    const accountLoginForm = document.getElementById('account-login-form');
    if (accountLoginForm) {
        accountLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Account login submitted');
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    try {
        const success = await AuthService.login(email, password);
        if (success) {
            hideModal('login-modal');
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        ErrorHandler.handle(error, 'Login');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const userData = {
        name: form.querySelector('[name="name"]').value,
        email: form.querySelector('[name="email"]').value,
        password: form.querySelector('[name="password"]').value
    };

    try {
        const success = await AuthService.register(userData);
        if (success) {
            hideModal('signup-modal');
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        ErrorHandler.handle(error, 'Signup');
    }
}

// Export functions for use in other files
export { showModal, hideModal };

document.addEventListener('DOMContentLoaded', initializeModals);