// Authentication Page Module
const authPage = {
    // Initialize auth page functionality
    init: () => {
        authPage.initTabs();
        authPage.initForms();
        
        // Redirect if already logged in
        if (auth.isAuthenticated()) {
            const redirectUrl = utils.getUrlParams().redirect || 'index.html';
            window.location.href = redirectUrl;
        }
    },

    // Initialize tab switching
    initTabs: () => {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');

        // Tab click handlers
        if (loginTab) {
            loginTab.addEventListener('click', () => {
                authPage.showLogin();
            });
        }

        if (registerTab) {
            registerTab.addEventListener('click', () => {
                authPage.showRegister();
            });
        }

        // Link click handlers
        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                authPage.showRegister();
            });
        }

        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                authPage.showLogin();
            });
        }
    },

    // Show login form
    showLogin: () => {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            authPage.clearMessages();
        }
    },

    // Show register form
    showRegister: () => {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginTab && registerTab && loginForm && registerForm) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authPage.clearMessages();
        }
    },

    // Initialize forms
    initForms: () => {
        const loginFormElement = document.getElementById('login-form-element');
        const registerFormElement = document.getElementById('register-form-element');

        if (loginFormElement) {
            loginFormElement.addEventListener('submit', authPage.handleLogin);
        }

        if (registerFormElement) {
            registerFormElement.addEventListener('submit', authPage.handleRegister);
        }
    },

    // Handle login form submission
    handleLogin: async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            authPage.showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            authPage.setLoading(true);
            authPage.clearMessages();
            
            await auth.login(email, password);
            
            authPage.showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect after successful login
            setTimeout(() => {
                const redirectUrl = utils.getUrlParams().redirect || 'index.html';
                window.location.href = redirectUrl;
            }, 1500);
            
        } catch (error) {
            authPage.showMessage(error.message || 'Login failed', 'error');
        } finally {
            authPage.setLoading(false);
        }
    },

    // Handle register form submission
    handleRegister: async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            authPage.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            authPage.showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            authPage.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            authPage.setLoading(true);
            authPage.clearMessages();
            
            await auth.register(name, email, password);
            
            authPage.showMessage('Registration successful! Redirecting...', 'success');
            
            // Redirect after successful registration
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            authPage.showMessage(error.message || 'Registration failed', 'error');
        } finally {
            authPage.setLoading(false);
        }
    },

    // Show message to user
    showMessage: (message, type = 'info') => {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `auth-message ${type}`;
            messageDiv.style.display = 'block';
            
            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    authPage.clearMessages();
                }, 3000);
            }
        }
    },

    // Clear messages
    clearMessages: () => {
        const messageDiv = document.getElementById('auth-message');
        if (messageDiv) {
            messageDiv.style.display = 'none';
            messageDiv.textContent = '';
            messageDiv.className = 'auth-message';
        }
    },

    // Set loading state
    setLoading: (isLoading) => {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (loginBtn) {
            loginBtn.disabled = isLoading;
            loginBtn.innerHTML = isLoading ? 
                '<i class="fas fa-spinner fa-spin"></i> Logging in...' : 
                '<i class="fas fa-sign-in-alt"></i> Login';
        }
        
        if (registerBtn) {
            registerBtn.disabled = isLoading;
            registerBtn.innerHTML = isLoading ? 
                '<i class="fas fa-spinner fa-spin"></i> Creating account...' : 
                '<i class="fas fa-user-plus"></i> Create Account';
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on auth page
    if (window.location.pathname.includes('auth.html')) {
        authPage.init();
    }
});