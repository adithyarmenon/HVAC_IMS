// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation
    initializeFormValidation();
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Setup role selection
    setupRoleSelection();
    
    // Load saved credentials if "Remember me" was checked
    loadSavedCredentials();
});

function initializeFormValidation() {
    const form = document.getElementById('loginForm');
    const alertDiv = document.getElementById('loginAlert');
    const alertMessage = document.getElementById('alertMessage');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        // Validate form
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Authenticating...';
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        // Simulate API call delay
        setTimeout(() => {
            // Validate credentials (in real app, this would be a server call)
            const isValid = validateCredentials(username, password, role);
            
            if (isValid) {
                // Save credentials if "Remember me" is checked
                if (rememberMe) {
                    saveCredentials(username, role);
                } else {
                    clearSavedCredentials();
                }
                
                // Set user session
                setUserSession(username, role);
                
                // Show success message
                alertDiv.className = 'alert alert-success';
                alertMessage.innerHTML = '<i class="bi bi-check-circle me-2"></i>Login successful! Redirecting...';
                alertDiv.classList.remove('d-none');
                
                // Redirect to main application
                setTimeout(() => {
                    window.location.href = 'dashboard';
                }, 1500);
            } else {
                // Show error message
                alertDiv.className = 'alert alert-danger';
                alertMessage.innerHTML = '<i class="bi bi-exclamation-circle me-2"></i>Invalid username, password, or role. Please try again.';
                alertDiv.classList.remove('d-none');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
                
                // Shake form for error feedback
                form.classList.add('shake-animation');
                setTimeout(() => {
                    form.classList.remove('shake-animation');
                }, 500);
            }
        }, 1500); // Simulate network delay
    });
}

function validateCredentials(username, password, role) {
    // Demo credentials - In production, this would validate against a server
    const demoCredentials = {
        'admin': { password: 'admin123', roles: ['admin', 'manager', 'store', 'production', 'dispatch'] },
        'store': { password: 'store123', roles: ['store'] },
        'production': { password: 'prod123', roles: ['production'] },
        'dispatch': { password: 'dispatch123', roles: ['dispatch'] },
        'manager': { password: 'manager123', roles: ['manager', 'store', 'dispatch'] }
    };
    
    if (demoCredentials[username]) {
        const user = demoCredentials[username];
        return user.password === password && user.roles.includes(role);
    }
    
    return false;
}

function setupPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const eyeIcon = toggleBtn.querySelector('i');
    
    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        if (type === 'text') {
            eyeIcon.className = 'bi bi-eye-slash';
            toggleBtn.setAttribute('title', 'Hide password');
        } else {
            eyeIcon.className = 'bi bi-eye';
            toggleBtn.setAttribute('title', 'Show password');
        }
    });
}

function setupRoleSelection() {
    const roleSelect = document.getElementById('role');
    const usernameInput = document.getElementById('username');
    
    // Auto-fill demo credentials based on role selection
    roleSelect.addEventListener('change', function() {
        const role = this.value;
        const demoUsers = {
            'store': 'store',
            'production': 'production',
            'dispatch': 'dispatch',
            'manager': 'manager',
            'admin': 'admin'
        };
        
        if (demoUsers[role] && (!usernameInput.value || usernameInput.value === 'admin')) {
            usernameInput.value = demoUsers[role];
        }
    });
    
    // Auto-select role based on username
    usernameInput.addEventListener('blur', function() {
        const username = this.value.toLowerCase();
        const roleMap = {
            'admin': 'admin',
            'store': 'store',
            'production': 'production',
            'prod': 'production',
            'dispatch': 'dispatch',
            'sales': 'dispatch',
            'manager': 'manager',
            'mgr': 'manager'
        };
        
        if (roleMap[username] && roleSelect.value === '') {
            roleSelect.value = roleMap[username];
        }
    });
}

function saveCredentials(username, role) {
    const credentials = {
        username: username,
        role: role,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem('hvac_ims_credentials', JSON.stringify(credentials));
}

function loadSavedCredentials() {
    const saved = localStorage.getItem('hvac_ims_credentials');
    
    if (saved) {
        try {
            const credentials = JSON.parse(saved);
            const now = new Date().getTime();
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            
            // Load if saved within last week
            if (now - credentials.timestamp < oneWeek) {
                document.getElementById('username').value = credentials.username;
                document.getElementById('role').value = credentials.role;
                document.getElementById('rememberMe').checked = true;
            } else {
                // Clear expired credentials
                clearSavedCredentials();
            }
        } catch (e) {
            console.error('Error loading saved credentials:', e);
            clearSavedCredentials();
        }
    }
}

function clearSavedCredentials() {
    localStorage.removeItem('hvac_ims_credentials');
}

function setUserSession(username, role) {
    // Create session object
    const session = {
        username: username,
        role: role,
        fullName: getFullName(username),
        loginTime: new Date().toISOString(),
        permissions: getRolePermissions(role)
    };
    
    // Store in sessionStorage
    sessionStorage.setItem('hvac_ims_session', JSON.stringify(session));
    
    // Also store in localStorage for demo (in real app, use proper session management)
    localStorage.setItem('hvac_ims_current_user', JSON.stringify(session));
}

function getFullName(username) {
    const nameMap = {
        'admin': 'System Administrator',
        'store': 'John Doe',
        'production': 'Mike Johnson',
        'dispatch': 'Sarah Smith',
        'manager': 'Robert Wilson'
    };
    
    return nameMap[username] || username;
}

function getRolePermissions(role) {
    const permissions = {
        'store': ['view_inventory', 'create_transaction', 'view_reports'],
        'production': ['view_raw_materials', 'consume_materials', 'view_production_schedule'],
        'dispatch': ['view_finished_goods', 'dispatch_goods', 'view_orders'],
        'manager': ['view_all', 'approve_transactions', 'generate_reports', 'view_analytics'],
        'admin': ['all_permissions', 'manage_users', 'manage_masters', 'system_settings']
    };
    
    return permissions[role] || [];
}

// Forgot password functionality
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href="#forgot-password"]')) {
        e.preventDefault();
        showForgotPasswordModal();
    }
});

function showForgotPasswordModal() {
    const modalHTML = `
        <div class="modal fade" id="forgotPasswordModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-key me-2"></i>Reset Password
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Enter your username or email address to receive a password reset link.</p>
                        <form id="resetPasswordForm">
                            <div class="mb-3">
                                <label for="resetUsername" class="form-label">Username or Email</label>
                                <input type="text" class="form-control" id="resetUsername" placeholder="Enter your username or email" required>
                            </div>
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                A password reset link will be sent to your registered email address.
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitPasswordReset()">Send Reset Link</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    modal.show();
    
    // Clean up modal after hidden
    document.getElementById('forgotPasswordModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function submitPasswordReset() {
    const username = document.getElementById('resetUsername')?.value;
    
    if (!username) {
        alert('Please enter your username or email address.');
        return;
    }
    
    // Simulate password reset request
    const resetBtn = document.querySelector('#forgotPasswordModal .btn-primary');
    const originalText = resetBtn.innerHTML;
    resetBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
    resetBtn.disabled = true;
    
    setTimeout(() => {
        // Simulate success
        resetBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i>Sent!';
        resetBtn.className = 'btn btn-success';
        
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
            modal.hide();
            
            // Show success message on login page
            const alertDiv = document.getElementById('loginAlert');
            const alertMessage = document.getElementById('alertMessage');
            alertDiv.className = 'alert alert-success';
            alertMessage.innerHTML = '<i class="bi bi-envelope-check me-2"></i>Password reset link has been sent to your email.';
            alertDiv.classList.remove('d-none');
        }, 1000);
    }, 1500);
}

// Add shake animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .shake-animation {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);