import { ApiService } from '../api.js';
import { SecureStorage } from './secure-storage.js';
import { ErrorHandler } from './error-handler.js';

export class AuthService {
    static async login(email, password) {
        try {
            const response = await ApiService.login(email, password);
            if (response.token) {
                await SecureStorage.setItem('auth_token', response.token);
                await SecureStorage.setItem('user', response.user);
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handle(error, 'Login');
            return false;
        }
    }

    static async register(userData) {
        try {
            const response = await ApiService.register(userData);
            if (response.token) {
                await SecureStorage.setItem('auth_token', response.token);
                await SecureStorage.setItem('user', response.user);
                return true;
            }
            return false;
        } catch (error) {
            ErrorHandler.handle(error, 'Register');
            return false;
        }
    }

    static async logout() {
        try {
            await ApiService.logout();
            await SecureStorage.removeItem('auth_token');
            await SecureStorage.removeItem('user');
            window.location.href = '/';
        } catch (error) {
            ErrorHandler.handle(error, 'Logout');
        }
    }
}
