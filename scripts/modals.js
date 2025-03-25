// Modal functionality
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Cookie consent functions
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'accepted');
    hideModal('cookie-modal');
}

function customizeCookies() {
    // Implement cookie customization logic
    console.log('Cookie customization clicked');
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

// Check cookie consent on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('cookieConsent')) {
        showModal('cookie-modal');
    }

    // Add event listeners for login buttons
    const loginButtons = document.querySelectorAll('button:contains("LOG IN")');
    loginButtons.forEach(button => {
        button.addEventListener('click', () => showModal('login-modal'));
    });
});

// Handle form submissions
document.getElementById('phone-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Implement phone login logic
    console.log('Phone login submitted');
});

document.getElementById('account-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    // Implement account login logic
    console.log('Account login submitted');
});