export const Validators = {
    email: (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) ? '' : 'Invalid email format';
    },

    password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain number';
        return '';
    },

    required: (value) => {
        return value?.trim() ? '' : 'This field is required';
    }
};
