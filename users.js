// User Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadUsersTable();
    
    // Setup event listeners for filters
    document.getElementById('searchUsers').addEventListener('input', filterUsers);
    document.getElementById('filterRole').addEventListener('change', filterUsers);
});

// Sample users data
const sampleUsers = [
    {
        id: 1,
        userId: 'ADM001',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john.doe@hvaccompany.com',
        username: 'john_doe',
        role: 'admin',
        department: 'IT',
        lastLogin: '2023-10-26 09:30',
        status: 'active',
        created: '2023-01-15'
    },
    {
        id: 2,
        userId: 'STO001',
        firstName: 'Sarah',
        lastName: 'Smith',
        fullName: 'Sarah Smith',
        email: 'sarah.smith@hvaccompany.com',
        username: 'sarah_smith',
        role: 'store',
        department: 'Warehouse',
        lastLogin: '2023-10-25 14:20',
        status: 'active',
        created: '2023-02-20'
    },
    {
        id: 3,
        userId: 'PRO001',
        firstName: 'Mike',
        lastName: 'Johnson',
        fullName: 'Mike Johnson',
        email: 'mike.johnson@hvaccompany.com',
        username: 'mike_johnson',
        role: 'production',
        department: 'Production',
        lastLogin: '2023-10-26 08:15',
        status: 'active',
        created: '2023-03-10'
    },
    {
        id: 4,
        userId: 'DIS001',
        firstName: 'Robert',
        lastName: 'Brown',
        fullName: 'Robert Brown',
        email: 'robert.brown@hvaccompany.com',
        username: 'robert_brown',
        role: 'dispatch',
        department: 'Logistics',
        lastLogin: '2023-10-24 11:45',
        status: 'active',
        created: '2023-04-05'
    },
    {
        id: 5,
        userId: 'MGR001',
        firstName: 'Lisa',
        lastName: 'Wang',
        fullName: 'Lisa Wang',
        email: 'lisa.wang@hvaccompany.com',
        username: 'lisa_wang',
        role: 'manager',
        department: 'Inventory',
        lastLogin: '2023-10-26 10:00',
        status: 'active',
        created: '2023-05-15'
    },
    {
        id: 6,
        userId: 'STO002',
        firstName: 'David',
        lastName: 'Wilson',
        fullName: 'David Wilson',
        email: 'david.wilson@hvaccompany.com',
        username: 'david_wilson',
        role: 'store',
        department: 'Warehouse',
        lastLogin: '2023-10-23 16:30',
        status: 'inactive',
        created: '2023-06-20'
    }
];

function loadUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';
    
    sampleUsers.forEach(user => {
        const roleBadge = getRoleBadge(user.role);
        const statusBadge = user.status === 'active' 
            ? '<span class="badge bg-success">Active</span>' 
            : '<span class="badge bg-secondary">Inactive</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${roleBadge}</td>
            <td>${user.department}</td>
            <td>${user.lastLogin}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewUser(${user.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                    <i class="bi bi-trash"></i>
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="resetPassword(${user.id})">
                    <i class="bi bi-key"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getRoleBadge(role) {
    const badges = {
        'admin': '<span class="badge bg-danger">Administrator</span>',
        'store': '<span class="badge bg-primary">Store Manager</span>',
        'production': '<span class="badge bg-success">Production Supervisor</span>',
        'dispatch': '<span class="badge bg-info">Dispatch Officer</span>',
        'manager': '<span class="badge bg-warning">Inventory Manager</span>'
    };
    return badges[role] || '<span class="badge bg-secondary">User</span>';
}

function filterUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const roleFilter = document.getElementById('filterRole').value;
    
    const rows = document.querySelectorAll('#usersTableBody tr');
    
    rows.forEach(row => {
        const cells = row.cells;
        const name = cells[1].textContent.toLowerCase();
        const email = cells[2].textContent.toLowerCase();
        const role = cells[3].querySelector('.badge').textContent.toLowerCase();
        
        let showRow = true;
        
        if (searchTerm && !name.includes(searchTerm) && !email.includes(searchTerm)) {
            showRow = false;
        }
        
        if (roleFilter) {
            const roleMap = {
                'admin': 'administrator',
                'store': 'store manager',
                'production': 'production supervisor',
                'dispatch': 'dispatch officer',
                'manager': 'inventory manager'
            };
            if (!role.includes(roleMap[roleFilter] || roleFilter)) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function saveUser() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('userEmail').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('userRole').value;
    const department = document.getElementById('department').value;
    
    // Validation
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !role) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    // Generate user ID
    const userId = generateUserId(role);
    
    const newUser = {
        id: Date.now(),
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        fullName: `${firstName} ${lastName}`,
        email: email,
        username: username,
        role: role,
        department: department || 'Inventory',
        lastLogin: 'Never',
        status: 'active',
        created: new Date().toISOString().split('T')[0]
    };
    
    sampleUsers.push(newUser);
    loadUsersTable();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
    modal.hide();
    document.getElementById('addUserForm').reset();
    
    alert(`User ${newUser.fullName} added successfully!\nUser ID: ${userId}`);
}

function generateUserId(role) {
    const rolePrefixes = {
        'admin': 'ADM',
        'store': 'STO',
        'production': 'PRO',
        'dispatch': 'DIS',
        'manager': 'MGR'
    };
    
    const prefix = rolePrefixes[role] || 'USR';
    const count = sampleUsers.filter(u => u.role === role).length + 1;
    
    return `${prefix}${String(count).padStart(3, '0')}`;
}

function viewUser(id) {
    const user = sampleUsers.find(u => u.id === id);
    if (user) {
        const modalHTML = `
            <div class="modal fade" id="viewUserModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">User Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <dl class="row">
                                <dt class="col-sm-4">User ID:</dt>
                                <dd class="col-sm-8">${user.userId}</dd>
                                
                                <dt class="col-sm-4">Full Name:</dt>
                                <dd class="col-sm-8">${user.fullName}</dd>
                                
                                <dt class="col-sm-4">Email:</dt>
                                <dd class="col-sm-8">${user.email}</dd>
                                
                                <dt class="col-sm-4">Username:</dt>
                                <dd class="col-sm-8">${user.username}</dd>
                                
                                <dt class="col-sm-4">Role:</dt>
                                <dd class="col-sm-8">${getRoleBadge(user.role)}</dd>
                                
                                <dt class="col-sm-4">Department:</dt>
                                <dd class="col-sm-8">${user.department}</dd>
                                
                                <dt class="col-sm-4">Last Login:</dt>
                                <dd class="col-sm-8">${user.lastLogin}</dd>
                                
                                <dt class="col-sm-4">Status:</dt>
                                <dd class="col-sm-8">${user.status === 'active' ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>'}</dd>
                                
                                <dt class="col-sm-4">Created Date:</dt>
                                <dd class="col-sm-8">${user.created}</dd>
                            </dl>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
        modal.show();
        
        document.getElementById('viewUserModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

function editUser(id) {
    const user = sampleUsers.find(u => u.id === id);
    if (user) {
        // Pre-fill form
        const nameParts = user.fullName.split(' ');
        document.getElementById('firstName').value = nameParts[0];
        document.getElementById('lastName').value = nameParts.slice(1).join(' ');
        document.getElementById('userEmail').value = user.email;
        document.getElementById('username').value = user.username;
        document.getElementById('userRole').value = user.role;
        document.getElementById('department').value = user.department;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
        
        // Update button action
        const saveBtn = document.querySelector('#addUserModal .btn-primary');
        saveBtn.textContent = 'Update User';
        saveBtn.onclick = function() { updateUser(id); };
        
        // Hide password fields for editing
        document.getElementById('password').closest('.col-md-6').style.display = 'none';
        document.getElementById('confirmPassword').closest('.col-md-6').style.display = 'none';
    }
}

function updateUser(id) {
    alert('Update functionality for user ' + id + ' would be implemented here.');
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        const index = sampleUsers.findIndex(u => u.id === id);
        if (index !== -1) {
            sampleUsers.splice(index, 1);
            loadUsersTable();
            alert('User deleted successfully!');
        }
    }
}

function resetPassword(id) {
    if (confirm('Reset password for this user?')) {
        // Generate a random temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        alert(`Temporary password generated: ${tempPassword}\n\nPlease inform the user to change their password immediately.`);
    }
}