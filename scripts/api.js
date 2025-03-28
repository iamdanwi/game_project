import { ErrorHandler } from './services/error-handler.js';
import { SecureStorage } from './services/secure-storage.js';
import { API_CONFIG } from './config.js';

export class ApiService {
    static #loadingStates = new Map();

    static async request(endpoint, options = {}) {
        this.setLoading(endpoint, true);

        try {
            const token = await SecureStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            };

            const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            return await response.json();
        } catch (error) {
            ErrorHandler.handle(error, `API Request: ${endpoint}`);
            throw error;
        } finally {
            this.setLoading(endpoint, false);
        }
    }

    static setLoading(endpoint, isLoading) {
        this.#loadingStates.set(endpoint, isLoading);
        this.updateLoadingUI(endpoint, isLoading);
    }

    static updateLoadingUI(endpoint, isLoading) {
        const loadingEl = document.querySelector(`[data-loading="${endpoint}"]`);
        if (loadingEl) {
            loadingEl.style.display = isLoading ? 'block' : 'none';
        }
    }

    static initializeWebSocket() {
        try {
            this.ws = new WebSocket('wss://book2500.funzip.in/ws');

            this.ws.onopen = () => {
                console.log('WebSocket Connected');
            };

            this.ws.onclose = () => {
                console.log('WebSocket Disconnected');
                // Only attempt reconnection if page is active
                if (document.visibilityState === 'visible') {
                    setTimeout(() => this.initializeWebSocket(), 5000);
                }
            };

            this.ws.onerror = (error) => {
                ErrorHandler.handle(error, 'WebSocket');
                // Force close to trigger reconnection
                this.ws.close();
            };
        } catch (error) {
            ErrorHandler.handle(error, 'WebSocket Initialization');
        }
    }

    static subscribeToUpdates(matchId) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'SUBSCRIBE',
                payload: { matchId }
            }));
        }
    }

    static unsubscribeFromUpdates(matchId) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'UNSUBSCRIBE',
                payload: { matchId }
            }));
        }
    }

    // Auth APIs
    static async login(email, password) {
        return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(userData) {
        return this.request(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async logout() {
        return this.request(API_CONFIG.ENDPOINTS.LOGOUT, {
            method: 'POST'
        });
    }

    // Data APIs
    static async getHome() {
        return this.request(API_CONFIG.ENDPOINTS.HOME);
    }

    static async getNews() {
        return this.request(API_CONFIG.ENDPOINTS.NEWS);
    }

    static async getPredictions() {
        return this.request(API_CONFIG.ENDPOINTS.PREDICTION);
    }

    static async getCategoryMatches(categoryId) {
        return this.request(`${API_CONFIG.ENDPOINTS.CATEGORY}${categoryId}`);
    }

    // Profile APIs
    static async getProfile() {
        return this.request(API_CONFIG.ENDPOINTS.PROFILE);
    }

    static async updateProfile(profileData) {
        return this.request(API_CONFIG.ENDPOINTS.PROFILE, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    static async changePassword(passwordData) {
        return this.request(API_CONFIG.ENDPOINTS.PASSWORD, {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });
    }

    // Transaction APIs
    static async getDepositGateway() {
        return this.request(API_CONFIG.ENDPOINTS.GATEWAY);
    }

    static async processDeposit(depositData) {
        return this.request(API_CONFIG.ENDPOINTS.DEPOSIT, {
            method: 'POST',
            body: JSON.stringify(depositData)
        });
    }

    static async getDepositLog() {
        return this.request(API_CONFIG.ENDPOINTS.DEPOSIT_LOG);
    }

    static async getTransactionLog() {
        return this.request(API_CONFIG.ENDPOINTS.TRANSACTION_LOG);
    }

    static async getBetLog() {
        return this.request(API_CONFIG.ENDPOINTS.BET_LOG);
    }

    static async getWithdrawMethods() {
        return this.request(API_CONFIG.ENDPOINTS.WITHDRAW);
    }

    static async confirmWithdraw(withdrawData) {
        return this.request(API_CONFIG.ENDPOINTS.WITHDRAW_CONFIRM, {
            method: 'POST',
            body: JSON.stringify(withdrawData)
        });
    }
}
