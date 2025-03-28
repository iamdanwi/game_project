import { AuthService } from './services/auth.js';
import { ApiService } from './api.js';
import { Validators } from './utils/validation.js';
import { showModal, hideModal } from './modals.js';
import { ErrorHandler } from './services/error-handler.js';
import { SecureStorage } from './services/secure-storage.js';

document.addEventListener('DOMContentLoaded', async function () {
    try {
        await initializeMenuHandlers();
        await initializeAuth();
        await loadPageData();
        if (navigator.onLine) {
            initializeWebSocket();
        }
    } catch (error) {
        ErrorHandler.handle(error, 'Initialization');
    }
});

function initializeMenuHandlers() {
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

    const indicators = document.querySelectorAll('.indicator-dot');
    if (indicators.length > 0) {
        let currentSlide = 0;
        setInterval(() => {
            indicators[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % indicators.length;
            indicators[currentSlide].classList.add('active');
        }, 5000);
    }
}

async function initializeAuth() {
    try {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) loginBtn.addEventListener('click', () => showModal('login-modal'));
        if (signupBtn) signupBtn.addEventListener('click', () => showModal('signup-modal'));
        if (logoutBtn) logoutBtn.addEventListener('click', () => AuthService.logout());

        await checkAuthStatus();
    } catch (error) {
        ErrorHandler.handle(error, 'Auth Initialization');
    }
}

async function checkAuthStatus() {
    const token = await SecureStorage.getItem('auth_token');
    const authButtons = document.querySelector('.auth-buttons');
    const userMenu = document.querySelector('.user-menu');

    if (token && authButtons && userMenu) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
    }
}

async function loadPageData() {
    const pathname = window.location.pathname;

    try {
        switch (true) {
            case pathname === '/' || pathname.includes('index.html'):
                await loadHomeData();
                break;
            case pathname.includes('cricket.html'):
                await loadCricketData();
                break;
            case pathname.includes('profile.html'):
                await loadProfileData();
                break;
            case pathname.includes('transactions.html'):
                await loadTransactionData();
                break;
        }
    } catch (error) {
        ErrorHandler.handle(error, 'Page Load');
    }
}

async function loadHomeData() {
    const homeData = await ApiService.getHome();
    const newsData = await ApiService.getNews();
    const predictions = await ApiService.getPredictions();

    updateHomeUI(homeData);
    updateNewsUI(newsData);
    updatePredictionsUI(predictions);
}

async function loadCricketData() {
    const matches = await ApiService.getCategoryMatches('cricket');
    updateCricketMatches(matches);
}

async function loadProfileData() {
    const profile = await ApiService.getProfile();
    updateProfileUI(profile);
}

async function loadTransactionData() {
    const [deposits, transactions, bets] = await Promise.all([
        ApiService.getDepositLog(),
        ApiService.getTransactionLog(),
        ApiService.getBetLog()
    ]);

    updateTransactionUI({ deposits, transactions, bets });
}

function updateHomeUI(data) {
    const gamesSection = document.querySelector('.grid-cols-2.md\\:grid-cols-3');
    if (!gamesSection || !data.games) return;

    const gamesHTML = data.games.map(game => `
        <a href="${game.url}" class="rounded-lg bg-opacity-10 p-4 mb-3 flex items-center flex-col">
            <img src="${game.icon}" alt="${game.name}" class="mx-auto w-16 h-16 md:w-24 md:h-24">
            <p class="text-white text-sm md:text-base font-bold">${game.name}</p>
        </a>
    `).join('');

    gamesSection.innerHTML = gamesHTML;
}

function updateCricketMatches(matches) {
    const container = document.querySelector('.cricket-table');
    if (!container) return;

    const matchesHTML = matches.map(match => `
        <div class="py-2 px-4 border-t border-gray-700">
            <p class="text-gray-400">${formatDate(match.date)}</p>
            <div class="flex justify-between items-center">
                <p class="text-white text-xl">${match.league}</p>
                ${match.isLive ? '<span class="live-tag">LIVE</span>' : ''}
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mt-2">
                ${match.odds.map(odd => `
                    <div class="cricket-cell ${odd.type === 'pink' ? 'cell-pink' : 'cell-blue'}">
                        ${odd.value || '------'}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    container.querySelector('.py-2').insertAdjacentHTML('afterend', matchesHTML);
}

function updateNewsUI(news) {
    const newsContainer = document.querySelector('.news-section');
    if (!newsContainer || !news.items) return;

    const newsHTML = news.items.map(item => `
        <div class="news-item bg-purple-900 bg-opacity-50 rounded-lg p-4 mb-4">
            <h3 class="text-white text-xl font-bold mb-2">${item.title}</h3>
            <p class="text-gray-300">${item.content}</p>
            <span class="text-gray-400 text-sm">${new Date(item.date).toLocaleDateString()}</span>
        </div>
    `).join('');

    newsContainer.innerHTML = newsHTML;
}

function updatePredictionsUI(predictions) {
    const predictionsContainer = document.querySelector('.predictions-section');
    if (!predictionsContainer || !predictions.items) return;

    const predictionsHTML = predictions.items.map(prediction => `
        <div class="prediction-item bg-purple-900 bg-opacity-50 rounded-lg p-4 mb-4">
            <h3 class="text-white text-xl font-bold mb-2">${prediction.matchTitle}</h3>
            <p class="text-gray-300">${prediction.prediction}</p>
            <div class="flex justify-between mt-2">
                <span class="text-gray-400 text-sm">${prediction.date}</span>
                <span class="text-green-400">${prediction.confidence}% confidence</span>
            </div>
        </div>
    `).join('');

    predictionsContainer.innerHTML = predictionsHTML;
}

function updateProfileUI(profile) {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;

    Object.entries(profile).forEach(([key, value]) => {
        const input = profileForm.querySelector(`[name="${key}"]`);
        if (input) input.value = value;
    });
}

function updateTransactionUI({ deposits, transactions, bets }) {
    const depositsTable = document.querySelector('.deposits-table tbody');
    if (depositsTable) {
        depositsTable.innerHTML = deposits.map(deposit => `
            <tr>
                <td>${deposit.date}</td>
                <td>${deposit.amount}</td>
                <td>${deposit.status}</td>
            </tr>
        `).join('');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    if (!Validators.email(email) || !Validators.password(password)) {
        ErrorHandler.handle(new Error('Invalid credentials'), 'Login');
        return;
    }

    const success = await AuthService.login(email, password);
    if (success) window.location.href = '/dashboard.html';
}

async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const userData = {
        name: form.querySelector('[name="name"]').value,
        email: form.querySelector('[name="email"]').value,
        password: form.querySelector('[name="password"]').value
    };

    const success = await AuthService.register(userData);
    if (success) window.location.href = '/dashboard.html';
}

function initializeWebSocket() {
    try {
        ApiService.initializeWebSocket();

        // Monitor connection status
        window.addEventListener('online', () => {
            ApiService.initializeWebSocket();
        });

        window.addEventListener('offline', () => {
            if (ApiService.ws) {
                ApiService.ws.close();
            }
        });
    } catch (error) {
        ErrorHandler.handle(error, 'WebSocket');
    }
}

function handleWebSocketUpdate(data) {
    switch (data.type) {
        case 'MATCH_UPDATE':
            updateLiveMatch(data.payload);
            break;
        case 'ODDS_UPDATE':
            updateLiveOdds(data.payload);
            break;
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' (IST)';
}

const handleResize = () => {
    const isMobile = window.innerWidth < 768;
    document.body.classList.toggle('mobile-view', isMobile);

    const elements = document.querySelectorAll('.responsive-element');
    elements.forEach(el => {
        el.classList.toggle('mobile-layout', isMobile);
    });
}

window.addEventListener('resize', handleResize);
handleResize();