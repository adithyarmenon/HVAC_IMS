// Main application JavaScript for HVAC IMS

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Setup navigation
    setupNavigation();
    
    // Initialize charts
    initializeCharts();
    
    // Setup event listeners
    setupEventListeners();
});

function setupNavigation() {
    // Handle sidebar navigation
    const navLinks = document.querySelectorAll('.list-group-item, .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const pageId = this.getAttribute('href').substring(1);
                loadPage(pageId);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function loadPage(pageId) {
    // This would normally load content via AJAX
    // For now, we'll just update the main content title
    const contentArea = document.getElementById('content-area');
    const pageTitles = {
        'dashboard': 'Dashboard',
        'raw-materials': 'Raw Materials Inventory',
        'finished-goods': 'Finished Goods Inventory',
        'transactions': 'Inventory Transactions',
        'warehouse': 'Warehouse Management',
        'reports': 'Inventory Reports',
        'items': 'Item Master',
        'locations': 'Location Master',
        'users': 'User Management'
    };
    
    const title = pageTitles[pageId] || 'Dashboard';
    document.querySelector('#content-area h1').textContent = title;
    
    // Show notification for demonstration
    showNotification(`Loading ${title}...`, 'info');
}

function initializeCharts() {
    // Inventory Movement Chart
    const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
    const inventoryChart = new Chart(inventoryCtx, {
        type: 'line',
        data: {
            labels: ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 30'],
            datasets: [{
                label: 'Inward',
                data: [120, 190, 300, 500, 200, 300, 450],
                borderColor: '#198754',
                backgroundColor: 'rgba(25, 135, 84, 0.1)',
                tension: 0.1,
                fill: true
            }, {
                label: 'Outward',
                data: [70, 90, 150, 200, 120, 180, 220],
                borderColor: '#dc3545',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                }
            }
        }
    });

    // Warehouse Distribution Chart
    const warehouseCtx = document.getElementById('warehouseChart').getContext('2d');
    const warehouseChart = new Chart(warehouseCtx, {
        type: 'doughnut',
        data: {
            labels: ['Main Warehouse', 'Production Area', 'Dispatch Area', 'Chemicals Store', 'Packaging Area'],
            datasets: [{
                data: [35, 20, 15, 10, 20],
                backgroundColor: [
                    '#0d6efd',
                    '#198754',
                    '#ffc107',
                    '#6f42c1',
                    '#fd7e14'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

function setupEventListeners() {
    // Quick action buttons
    const quickActionButtons = document.querySelectorAll('.quick-action-btn, .btn-primary');
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.textContent.includes('New Transaction')) {
                showNewTransactionModal();
            } else if (this.textContent.includes('Reorder')) {
                showReorderModal(this.closest('tr').querySelector('td').textContent);
            }
        });
    });
    
    // Search functionality
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.className = 'form-control form-control-dark';
    searchInput.placeholder = 'Search inventory...';
    searchInput.style.width = '200px';
    
    searchInput.addEventListener('input', function(e) {
        filterInventory(this.value);
    });
    
    // Add search to navbar
    const navbarNav = document.querySelector('.navbar-nav.me-auto');
    const searchLi = document.createElement('li');
    searchLi.className = 'nav-item';
    searchLi.style.marginLeft = '10px';
    searchLi.appendChild(searchInput);
    navbarNav.appendChild(searchLi);
}

function filterInventory(searchTerm) {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function showNewTransactionModal() {
    // Create and show a modal for new transaction
    const modalHTML = `
        <div class="modal fade" id="newTransactionModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">New Inventory Transaction</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="transactionForm">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Transaction Type</label>
                                    <select class="form-select" required>
                                        <option value="">Select type</option>
                                        <option value="inward">Inward (Purchase/Receipt)</option>
                                        <option value="outward">Outward (Consumption/Dispatch)</option>
                                        <option value="transfer">Transfer between Locations</option>
                                        <option value="adjustment">Stock Adjustment</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Item</label>
                                    <select class="form-select" required>
                                        <option value="">Select item</option>
                                        <option value="1">Filter Media MERV 8</option>
                                        <option value="2">Filter Media MERV 13</option>
                                        <option value="3">Aluminum Frames</option>
                                        <option value="4">Activated Carbon</option>
                                        <option value="5">Panel Filter 24x24</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Quantity</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" placeholder="Enter quantity" required>
                                        <span class="input-group-text">units</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">From Location</label>
                                    <select class="form-select">
                                        <option value="">Select source location</option>
                                        <option value="main">Main Warehouse</option>
                                        <option value="production">Production Area</option>
                                        <option value="dispatch">Dispatch Area</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">To Location</label>
                                    <select class="form-select">
                                        <option value="">Select destination location</option>
                                        <option value="main">Main Warehouse</option>
                                        <option value="production">Production Area</option>
                                        <option value="dispatch">Dispatch Area</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Reference/Notes</label>
                                <textarea class="form-control" rows="3" placeholder="Add any reference or notes..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitTransaction()">Save Transaction</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('newTransactionModal'));
    modal.show();
    
    // Clean up modal after hidden
    document.getElementById('newTransactionModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function submitTransaction() {
    // In a real app, this would send data to server
    showNotification('Transaction saved successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('newTransactionModal')).hide();
    
    // Simulate adding to recent transactions
    setTimeout(() => {
        showNotification('Inventory updated. Refresh recommended.', 'info');
    }, 1000);
}

function showReorderModal(itemName) {
    alert(`Reorder request for ${itemName} has been submitted to procurement.`);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Utility function to format numbers
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// Utility function to format dates
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}