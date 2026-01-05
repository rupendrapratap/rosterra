// Login form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Basic validation
        if (!validateEmail(email)) {
            showError(emailInput, 'Please enter a valid email address');
            return;
        }
        
        if (password.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            return;
        }
        
        // Clear any previous errors
        clearErrors();
        
        // Disable button during submission
        const submitButton = loginForm.querySelector('.login-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Signing in...';
        
        // Simulate login (redirect to dashboard)
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });
    
    // Real-time validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError(this, 'Please enter a valid email address');
        } else {
            clearError(this);
        }
    });
    
    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        if (password && password.length < 6) {
            showError(this, 'Password must be at least 6 characters');
        } else {
            clearError(this);
        }
    });
    
    // Clear errors on input
    emailInput.addEventListener('input', function() {
        clearError(this);
    });
    
    passwordInput.addEventListener('input', function() {
        clearError(this);
    });
});

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show error message
function showError(input, message) {
    clearError(input);
    
    input.classList.add('error');
    
    let errorDiv = input.parentElement.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        input.parentElement.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

// Clear error for specific input
function clearError(input) {
    input.classList.remove('error');
    const errorDiv = input.parentElement.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

// Clear all errors
function clearErrors() {
    const errorInputs = document.querySelectorAll('.form-group.error input');
    errorInputs.forEach(input => clearError(input));
}


