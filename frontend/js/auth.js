// Authentication Module
const auth = {
    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get auth token
    getToken: () => {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!auth.getToken();
    },

    // Save user and token to localStorage
    saveUserData: (userData) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        localStorage.setItem(STORAGE_KEYS.TOKEN, userData.token);
    },

    // Clear user data from localStorage
    clearUserData: () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    // Login user
    login: async (email, password) => {
        try {
            const response = await fetch(API_ENDPOINTS.USER_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Save user data
            auth.saveUserData(data);

            // Update UI
            auth.updateNavigation();
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Register user
    register: async (name, email, password) => {
        try {
            const response = await fetch(API_ENDPOINTS.USER_REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Save user data
            auth.saveUserData(data);

            // Update UI
            auth.updateNavigation();
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Logout user
    logout: () => {
        auth.clearUserData();
        cart.clearCart(); // Clear cart on logout
        auth.updateNavigation();
        utils.showToast('Logged out successfully', 'info');
        
        // Redirect to home page if on protected page
        const protectedPages = ['profile.html', 'orders.html', 'checkout.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    },

    // Update navigation based on auth status
    updateNavigation: () => {
        const authLinks = document.getElementById('auth-links');
        const userMenu = document.getElementById('user-menu');
        const userNameSpan = document.getElementById('user-name');

        if (auth.isAuthenticated()) {
            const user = auth.getCurrentUser();
            
            if (authLinks) authLinks.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userNameSpan) userNameSpan.textContent = user.name;
        } else {
            if (authLinks) authLinks.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    },

    // Get user profile
    getProfile: async () => {
        try {
            const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
                headers: {
                    'Authorization': `Bearer ${auth.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await fetch(API_ENDPOINTS.USER_PROFILE, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.getToken()}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profile update failed');
            }

            // Update stored user data
            auth.saveUserData(data);
            auth.updateNavigation();
            
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // Make authenticated API request
    apiRequest: async (url, options = {}) => {
        const token = auth.getToken();
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Check if token is expired
            if (response.status === 401) {
                auth.logout();
                utils.showToast('Session expired. Please login again.', 'error');
                window.location.href = 'auth.html';
                return;
            }

            return response;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    },

    // Protect routes that require authentication
    requireAuth: () => {
        if (!auth.isAuthenticated()) {
            utils.showToast('Please login to access this page', 'warning');
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    },

    // Initialize auth module
    init: () => {
        // Update navigation on page load
        auth.updateNavigation();

        // Add logout event listener
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                auth.logout();
            });
        }

        // Check authentication status on page load
        if (auth.isAuthenticated()) {
            // Verify token is still valid by making a test request
            auth.getProfile().catch(() => {
                // Token is invalid, logout user
                auth.logout();
            });
        }
    }
};

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});