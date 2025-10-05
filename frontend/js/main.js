// Main JavaScript Module
const main = {
    // Initialize mobile navigation
    initMobileNav: () => {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        }
    },

    // Initialize smooth scrolling for anchor links
    initSmoothScrolling: () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // Initialize scroll to top functionality
    initScrollToTop: () => {
        // Create scroll to top button
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollToTopBtn.className = 'scroll-to-top-btn';
        scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .scroll-to-top-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: #007bff;
                color: white;
                border: none;
                cursor: pointer;
                display: none;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                z-index: 1000;
                transition: all 0.3s ease;
            }
            
            .scroll-to-top-btn:hover {
                background: #0056b3;
                transform: translateY(-2px);
            }
            
            .scroll-to-top-btn.show {
                display: flex;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(scrollToTopBtn);

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    // Initialize form validation
    initFormValidation: () => {
        // Add real-time validation to all forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const isValid = main.validateForm(form);
                if (!isValid) {
                    e.preventDefault();
                }
            });

            // Add real-time validation to form fields
            form.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('blur', () => {
                    main.validateField(field);
                });

                field.addEventListener('input', () => {
                    // Clear validation message on input
                    main.clearFieldValidation(field);
                });
            });
        });
    },

    // Validate individual form field
    validateField: (field) => {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (field.type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                message = 'Password must be at least 6 characters long';
            }
        }

        // Confirm password validation
        if (field.name === 'confirmPassword' && value) {
            const passwordField = field.form.querySelector('input[name="password"]');
            if (passwordField && value !== passwordField.value) {
                isValid = false;
                message = 'Passwords do not match';
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }

        // Show validation message
        main.showFieldValidation(field, isValid, message);
        return isValid;
    },

    // Validate entire form
    validateForm: (form) => {
        let isValid = true;
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!main.validateField(field)) {
                isValid = false;
            }
        });
        return isValid;
    },

    // Show field validation message
    showFieldValidation: (field, isValid, message) => {
        main.clearFieldValidation(field);
        
        if (!isValid && message) {
            field.classList.add('invalid');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            `;
            field.parentNode.appendChild(errorDiv);
        } else {
            field.classList.remove('invalid');
        }
    },

    // Clear field validation
    clearFieldValidation: (field) => {
        field.classList.remove('invalid');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    // Initialize lazy loading for images
    initLazyLoading: () => {
        // Create intersection observer for lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    },

    // Handle page loading states
    handlePageLoading: () => {
        // Hide loading spinner when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                utils.hideLoading();
            }, 500);
        });

        // Show loading spinner for page navigation
        document.querySelectorAll('a:not([href^="#"]):not([href^="javascript:"]):not([onclick])').forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't show loading for external links or downloads
                if (link.hostname !== window.location.hostname || 
                    link.getAttribute('download') || 
                    link.getAttribute('target') === '_blank') {
                    return;
                }
                utils.showLoading();
            });
        });
    },

    // Initialize search functionality
    initSearch: () => {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            // Add search icon
            if (!input.parentNode.querySelector('.search-icon')) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-search search-icon';
                icon.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #666;
                    pointer-events: none;
                `;
                
                input.parentNode.style.position = 'relative';
                input.style.paddingRight = '35px';
                input.parentNode.appendChild(icon);
            }
        });
    },

    // Initialize tooltips
    initTooltips: () => {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = element.getAttribute('data-tooltip');
                tooltip.style.cssText = `
                    position: absolute;
                    background: #333;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 0.875rem;
                    z-index: 10000;
                    pointer-events: none;
                    white-space: nowrap;
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = element.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                
                // Remove tooltip when mouse leaves
                element.addEventListener('mouseleave', () => {
                    tooltip.remove();
                }, { once: true });
            });
        });
    },

    // Initialize modal functionality
    initModals: () => {
        // Close modal when clicking outside or on close button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-overlay') || e.target.matches('.modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="block"]');
                if (openModal) {
                    openModal.style.display = 'none';
                }
            }
        });
    },

    // Initialize all functionality
    init: () => {
        main.initMobileNav();
        main.initSmoothScrolling();
        main.initScrollToTop();
        main.initFormValidation();
        main.initLazyLoading();
        main.handlePageLoading();
        main.initSearch();
        main.initTooltips();
        main.initModals();
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    main.init();
});

// Global utility functions
window.showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
};

window.hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};