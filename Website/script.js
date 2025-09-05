// IADMA Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Form submission handling
    const heroForm = document.querySelector('form');
    if (heroForm) {
        heroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.innerHTML = '<div class="spinner inline-block mr-2"></div>Inscription en cours...';
            submitBtn.disabled = true;
            
            // Simulate API call (replace with actual API endpoint)
            setTimeout(() => {
                // Success state
                submitBtn.innerHTML = '✓ Inscription réussie !';
                submitBtn.classList.remove('bg-success-green', 'hover:bg-green-600');
                submitBtn.classList.add('bg-green-600');
                
                // Show success message
                showNotification('Inscription réussie ! Vérifiez votre email.', 'success');
                
                // Reset form after 3 seconds
                setTimeout(() => {
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-green-600');
                    submitBtn.classList.add('bg-success-green', 'hover:bg-green-600');
                }, 3000);
            }, 2000);
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        notification.classList.add(...colors[type].split(' '));
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-current opacity-70 hover:opacity-100">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.card, .stat-item, .feature-item').forEach(el => {
        observer.observe(el);
    });

    // Navbar scroll effect
    let lastScrollTop = 0;
    const navbar = document.querySelector('nav');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.classList.add('-translate-y-full');
        } else {
            // Scrolling up
            navbar.classList.remove('-translate-y-full');
        }
        
        // Add shadow when scrolled
        if (scrollTop > 10) {
            navbar.classList.add('shadow-lg');
        } else {
            navbar.classList.remove('shadow-lg');
        }
        
        lastScrollTop = scrollTop;
    });

    // Stats counter animation
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        }
        
        updateCounter();
    }

    // Animate stats when they come into view
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    statNumber.classList.add('animated');
                    const target = parseInt(statNumber.textContent);
                    animateCounter(statNumber, target);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item').forEach(stat => {
        statsObserver.observe(stat);
    });

    // Formation cards hover effects
    document.querySelectorAll('.formation-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hover-lift');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hover-lift');
        });
    });

    // Back to top button
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.className = 'fixed bottom-8 right-8 w-12 h-12 bg-primary-blue text-white rounded-full shadow-lg opacity-0 transition-all duration-300 hover:bg-primary-blue-dark z-40';
    backToTopBtn.style.transform = 'translateY(100px)';
    document.body.appendChild(backToTopBtn);

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.transform = 'translateY(100px)';
        }
    });

    // Form validation
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('border-red-500');
                isValid = false;
            } else {
                input.classList.remove('border-red-500');
            }

            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    input.classList.add('border-red-500');
                    isValid = false;
                }
            }

            // Phone validation (basic)
            if (input.type === 'tel' && input.value) {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
                if (!phoneRegex.test(input.value)) {
                    input.classList.add('border-red-500');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Real-time form validation
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('border-red-500');
            } else {
                this.classList.remove('border-red-500');
            }
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('border-red-500') && this.value.trim()) {
                this.classList.remove('border-red-500');
            }
        });
    });

    // Cookie consent (GDPR compliance)
    function showCookieConsent() {
        if (!localStorage.getItem('cookieConsent')) {
            const consent = document.createElement('div');
            consent.className = 'fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50';
            consent.innerHTML = `
                <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p class="text-sm">
                        Nous utilisons des cookies pour améliorer votre expérience. 
                        <a href="#" class="underline">En savoir plus</a>
                    </p>
                    <div class="flex gap-2">
                        <button onclick="acceptCookies()" class="bg-primary-blue hover:bg-primary-blue-dark px-4 py-2 rounded text-sm transition-colors">
                            Accepter
                        </button>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="border border-gray-600 hover:border-gray-400 px-4 py-2 rounded text-sm transition-colors">
                            Refuser
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(consent);
        }
    }

    window.acceptCookies = function() {
        localStorage.setItem('cookieConsent', 'true');
        document.querySelector('.fixed.bottom-0').remove();
    };

    // Show cookie consent after 2 seconds
    setTimeout(showCookieConsent, 2000);

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }
});

// Global utility functions
window.IADMA = {
    showNotification: function(message, type = 'info') {
        // Notification function available globally
        const event = new CustomEvent('showNotification', {
            detail: { message, type }
        });
        document.dispatchEvent(event);
    },
    
    trackEvent: function(eventName, properties = {}) {
        // Analytics tracking (integrate with Google Analytics, Mixpanel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
        console.log('Event tracked:', eventName, properties);
    }
};
