// utils.js - Funzioni helper e utility

const Utils = {
    // Formattazione valuta
    formatCurrency(value) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value || 0);
    },

    // Formattazione data
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('it-IT');
    },

    // Formattazione data con ora
    formatDateTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('it-IT');
    },

    // Get URL parameters
    getURLParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Navigate to page with params
    navigate(url, params = {}) {
        const urlParams = new URLSearchParams(params);
        const fullUrl = params && Object.keys(params).length > 0 
            ? `${url}?${urlParams.toString()}`
            : url;
        window.location.href = fullUrl;
    },

    // Show notification
    showNotification(message, type = 'success') {
        // Crea notification toast
        const notification = document.createElement('div');
        notification.className = `notification is-${type}`;
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            <button class="delete"></button>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove dopo 3 secondi
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // Remove on click
        notification.querySelector('.delete').addEventListener('click', () => {
            notification.remove();
        });
    },

    // Validate form
    validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && !value) {
                errors[field] = `${rule.label} è obbligatorio`;
            }
            
            if (rule.email && value && !this.isValidEmail(value)) {
                errors[field] = `${rule.label} non è valido`;
            }
            
            if (rule.min && value && value.length < rule.min) {
                errors[field] = `${rule.label} deve essere almeno ${rule.min} caratteri`;
            }
            
            if (rule.number && value && isNaN(value)) {
                errors[field] = `${rule.label} deve essere un numero`;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    // Email validation
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Get form data as object
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            // Handle checkboxes
            if (formElement.elements[key]?.type === 'checkbox') {
                data[key] = formElement.elements[key].checked;
            }
            // Handle numbers
            else if (formElement.elements[key]?.type === 'number') {
                data[key] = value ? parseFloat(value) : null;
            }
            // Handle regular inputs
            else {
                data[key] = value;
            }
        }
        
        return data;
    },

    // Set form data from object
    setFormData(formElement, data) {
        for (const [key, value] of Object.entries(data)) {
            const element = formElement.elements[key];
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value || '';
                }
            }
        }
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Generate random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Toggle form readonly
    setFormReadonly(formElement, readonly) {
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (readonly) {
                input.setAttribute('readonly', 'readonly');
                input.setAttribute('disabled', 'disabled');
            } else {
                input.removeAttribute('readonly');
                input.removeAttribute('disabled');
            }
        });
    },

    // Show/hide element
    show(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = '';
        }
    },

    hide(element) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    },

    // Calculate percentage
    percentage(value, total) {
        if (!total) return 0;
        return ((value / total) * 100).toFixed(1);
    }
};
