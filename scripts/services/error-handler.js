export class ErrorHandler {
    static handle(error, context = '') {
        const errorMessage = this.getErrorMessage(error);
        this.displayError(errorMessage, context);
        this.logError(error, context);
    }

    static getErrorMessage(error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            return 'Network connection error. Please check your internet connection.';
        }
        if (error.response) {
            return error.response.data.message || 'Server error occurred';
        }
        return error.message || 'An unexpected error occurred';
    }

    static displayError(message, context) {
        const errorContainer = document.getElementById('error-container') ||
            this.createErrorContainer();

        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = `${context}: ${message}`;

        errorContainer.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
    }

    static logError(error, context) {
        console.error(`[${context}]`, error);
        // Add production logging service here
    }
}
