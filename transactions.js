// Transactions Page JavaScript

// Sample transactions data
const sampleTransactions = [
    {
        id: 'TXN-001247',
        date: '2023-10-26',
        type: 'inward',
        itemId: 1,
        itemName: 'Filter Media MERV 8',
        quantity: 100,
        unit: 'rolls',
        fromLocation: '',
        toLocation: 'Main Warehouse',
        reference: 'PO-12345',
        notes: 'Purchase from ABC Suppliers',
        userId: 'john_doe',
        userName: 'John Doe',
        status: 'completed'
    },
    {
        id: 'TXN-001246',
        date: '2023-10-26',
        type: 'outward',
        itemId: 5,
        itemName: 'Panel Filter 24x24',
        quantity: 50,
        unit: 'pcs',
        fromLocation: 'Dispatch Area',
        toLocation: '',
        reference: 'SO-67890',
        notes: 'Dispatch to XYZ Corp',
        userId: 'sarah_smith',
        userName: 'Sarah Smith',
        status: 'completed'
    },
    {
        id: 'TXN-001245',
        date: '2023-10-25',
        type: 'transfer',
        itemId: 4,
        itemName: 'Activated Carbon',
        quantity: 30,
        unit: 'kg',
        fromLocation: 'Main Warehouse',
        toLocation: 'Production Area',
        reference: 'TRF-001',
        notes: 'Transfer for production batch',
        userId: 'mike_johnson',
        userName: 'Mike Johnson',
        status: 'completed'
    },
    {
        id: 'TXN-001244',
        date: '2023-10-25',
        type: 'inward',
        itemId: 3,
        itemName: 'Aluminum Frames',
        quantity: 200,
        unit: 'pcs',
        fromLocation: '',
        toLocation: 'Main Warehouse',
        reference: 'PO-12346',
        notes: 'Purchase from Metal Works Inc.',
        userId: 'john_doe',
        userName: 'John Doe',
        status: 'pending'
    },
    {
        id: 'TXN-001243',
        date: '2023-10-24',
        type: 'outward',
        itemId: 2,
        itemName: 'Bag Filters 36"',
        quantity: 25,
        unit: 'pcs',
        fromLocation: 'Dispatch Area',
        toLocation: '',
        reference: 'SO-67891',
        notes: 'International shipment',
        userId: 'sarah_smith',
        userName: 'Sarah Smith',
        status: 'completed'
    }
];

document.addEventListener('DOMContentLoaded', function() {
    loadTransactionsTable();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('endDate').value = today;
    
    // Setup event listeners
    document.getElementById('searchTransactions').addEventListener('input', filterTransactions);
    document.getElementById('transactionType').addEventListener('change', filterTransactions);
});

function loadTransactionsTable() {
    const tableBody = document.getElementById('transactionsTableBody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Populate table with sample data
    sampleTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        
        // Determine type badge
        let typeBadge;
        switch(transaction.type) {
            case 'inward':
                typeBadge = '<span class="badge bg-success">Inward</span>';
                break;
            case 'outward':
                typeBadge = '<span class="badge bg-danger">Outward</span>';
                break;
            case 'transfer':
                typeBadge = '<span class="badge bg-info">Transfer</span>';
                break;
            case 'adjustment':
                typeBadge = '<span class="badge bg-warning">Adjustment</span>';
                break;
            default:
                typeBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        // Determine status badge
        let statusBadge = transaction.status === 'completed' 
            ? '<span class="badge bg-success">Completed</span>'
            : '<span class="badge bg-warning">Pending</span>';
        
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.id}</td>
            <td>${typeBadge}</td>
            <td>${transaction.itemName}</td>
            <td>${transaction.quantity} ${transaction.unit}</td>
            <td>${transaction.fromLocation || '-'}</td>
            <td>${transaction.toLocation || '-'}</td>
            <td>${transaction.reference}</td>
            <td>${transaction.userName}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewTransaction('${transaction.id}')">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editTransaction('${transaction.id}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction('${transaction.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterTransactions() {
    const searchTerm = document.getElementById('searchTransactions').value.toLowerCase();
    const typeFilter = document.getElementById('transactionType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const rows = document.querySelectorAll('#transactionsTableBody tr');
    
    rows.forEach(row => {
        const cells = row.cells;
        const date = cells[0].textContent;
        const id = cells[1].textContent.toLowerCase();
        const type = cells[2].querySelector('.badge').textContent.toLowerCase();
        const item = cells[3].textContent.toLowerCase();
        const reference = cells[7].textContent.toLowerCase();
        const user = cells[8].textContent.toLowerCase();
        
        let showRow = true;
        
        // Search filter
        if (searchTerm) {
            if (!id.includes(searchTerm) && 
                !item.includes(searchTerm) && 
                !reference.includes(searchTerm) && 
                !user.includes(searchTerm)) {
                showRow = false;
            }
        }
        
        // Type filter
        if (typeFilter && !type.includes(typeFilter)) {
            showRow = false;
        }
        
        // Date filter
        if (startDate && date < startDate) {
            showRow = false;
        }
        if (endDate && date > endDate) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function clearTransactionFilters() {
    document.getElementById('searchTransactions').value = '';
    document.getElementById('transactionType').value = '';
    document.getElementById('startDate').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('endDate').value = today;
    
    filterTransactions();
}

function showNewTransactionModal(type = '') {
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
                                    <select class="form-select" id="txnType" required>
                                        <option value="">Select type</option>
                                        <option value="inward" ${type === 'inward' ? 'selected' : ''}>Inward (Purchase/Receipt)</option>
                                        <option value="outward" ${type === 'outward' ? 'selected' : ''}>Outward (Consumption/Dispatch)</option>
                                        <option value="transfer" ${type === 'transfer' ? 'selected' : ''}>Transfer between Locations</option>
                                        <option value="adjustment" ${type === 'adjustment' ? 'selected' : ''}>Stock Adjustment</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Date</label>
                                    <input type="datetime-local" class="form-control" id="txnDate" required>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Item</label>
                                    <select class="form-select" id="txnItem" required>
                                        <option value="">Select item</option>
                                        ${getItemOptions()}
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Quantity</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="txnQuantity" placeholder="Enter quantity" required>
                                        <span class="input-group-text" id="unitDisplay">units</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">From Location</label>
                                    <select class="form-select" id="txnFromLocation">
                                        <option value="">Select source location</option>
                                        <option value="main">Main Warehouse</option>
                                        <option value="production">Production Area</option>
                                        <option value="dispatch">Dispatch Area</option>
                                        <option value="chemical">Chemicals Store</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">To Location</label>
                                    <select class="form-select" id="txnToLocation">
                                        <option value="">Select destination location</option>
                                        <option value="main">Main Warehouse</option>
                                        <option value="production">Production Area</option>
                                        <option value="dispatch">Dispatch Area</option>
                                        <option value="chemical">Chemicals Store</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label class="form-label">Reference Number</label>
                                    <input type="text" class="form-control" id="txnReference" placeholder="PO/SO/TRF number">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Status</label>
                                    <select class="form-select" id="txnStatus" required>
                                        <option value="pending">Pending</option>
                                        <option value="completed" selected>Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes/Remarks</label>
                                <textarea class="form-control" id="txnNotes" rows="3" placeholder="Add any notes or remarks..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveTransaction()">Save Transaction</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set default date to now
    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);
    setTimeout(() => {
        document.getElementById('txnDate').value = localDateTime;
    }, 100);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('newTransactionModal'));
    modal.show();
    
    // Update unit display when item changes
    document.getElementById('txnItem').addEventListener('change', updateUnitDisplay);
    
    // Clean up modal after hidden
    document.getElementById('newTransactionModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function getItemOptions() {
    const rawMaterials = window.inventoryManager.inventoryData.rawMaterials;
    const finishedGoods = window.inventoryManager.inventoryData.finishedGoods;
    
    let options = '<optgroup label="Raw Materials">';
    rawMaterials.forEach(item => {
        options += `<option value="rm_${item.id}">${item.name} (${item.sku})</option>`;
    });
    options += '</optgroup>';
    
    options += '<optgroup label="Finished Goods">';
    finishedGoods.forEach(item => {
        options += `<option value="fg_${item.id}">${item.name} (${item.sku})</option>`;
    });
    options += '</optgroup>';
    
    return options;
}

function updateUnitDisplay() {
    const itemSelect = document.getElementById('txnItem');
    const unitDisplay = document.getElementById('unitDisplay');
    
    if (itemSelect.value) {
        const [type, id] = itemSelect.value.split('_');
        const items = type === 'rm' 
            ? window.inventoryManager.inventoryData.rawMaterials
            : window.inventoryManager.inventoryData.finishedGoods;
        
        const item = items.find(i => i.id == id);
        if (item) {
            unitDisplay.textContent = item.unit || 'units';
        }
    }
}

function saveTransaction() {
    // Get form values
    const txnType = document.getElementById('txnType').value;
    const txnDate = document.getElementById('txnDate').value;
    const txnItem = document.getElementById('txnItem').value;
    const txnQuantity = parseFloat(document.getElementById('txnQuantity').value);
    const txnFromLocation = document.getElementById('txnFromLocation').value;
    const txnToLocation = document.getElementById('txnToLocation').value;
    const txnReference = document.getElementById('txnReference').value;
    const txnStatus = document.getElementById('txnStatus').value;
    const txnNotes = document.getElementById('txnNotes').value;
    
    // Validate
    if (!txnType || !txnDate || !txnItem || isNaN(txnQuantity) || txnQuantity <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    // Generate transaction ID
    const txnId = 'TXN-' + String(Date.now()).slice(-6);
    
    // Create transaction object
    const newTransaction = {
        id: txnId,
        date: txnDate.split('T')[0],
        type: txnType,
        itemId: txnItem,
        quantity: txnQuantity,
        fromLocation: txnFromLocation,
        toLocation: txnToLocation,
        reference: txnReference,
        notes: txnNotes,
        userId: 'current_user',
        userName: 'Current User',
        status: txnStatus
    };
    
    // Add to sample transactions (in real app, this would go to server)
    sampleTransactions.unshift(newTransaction);
    
    // Update table
    loadTransactionsTable();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('newTransactionModal'));
    modal.hide();
    
    // Show success message
    alert(`Transaction ${txnId} saved successfully!`);
}

function viewTransaction(id) {
    const transaction = sampleTransactions.find(t => t.id === id);
    if (transaction) {
        const modalHTML = `
            <div class="modal fade" id="viewTransactionModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Transaction Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <dl class="row">
                                <dt class="col-sm-4">Transaction ID:</dt>
                                <dd class="col-sm-8">${transaction.id}</dd>
                                
                                <dt class="col-sm-4">Date:</dt>
                                <dd class="col-sm-8">${transaction.date}</dd>
                                
                                <dt class="col-sm-4">Type:</dt>
                                <dd class="col-sm-8">
                                    ${transaction.type === 'inward' ? '<span class="badge bg-success">Inward</span>' : 
                                      transaction.type === 'outward' ? '<span class="badge bg-danger">Outward</span>' : 
                                      transaction.type === 'transfer' ? '<span class="badge bg-info">Transfer</span>' : 
                                      '<span class="badge bg-warning">Adjustment</span>'}
                                </dd>
                                
                                <dt class="col-sm-4">Item:</dt>
                                <dd class="col-sm-8">${transaction.itemName}</dd>
                                
                                <dt class="col-sm-4">Quantity:</dt>
                                <dd class="col-sm-8">${transaction.quantity} ${transaction.unit}</dd>
                                
                                <dt class="col-sm-4">From:</dt>
                                <dd class="col-sm-8">${transaction.fromLocation || '-'}</dd>
                                
                                <dt class="col-sm-4">To:</dt>
                                <dd class="col-sm-8">${transaction.toLocation || '-'}</dd>
                                
                                <dt class="col-sm-4">Reference:</dt>
                                <dd class="col-sm-8">${transaction.reference}</dd>
                                
                                <dt class="col-sm-4">User:</dt>
                                <dd class="col-sm-8">${transaction.userName}</dd>
                                
                                <dt class="col-sm-4">Status:</dt>
                                <dd class="col-sm-8">
                                    ${transaction.status === 'completed' ? '<span class="badge bg-success">Completed</span>' : 
                                      transaction.status === 'pending' ? '<span class="badge bg-warning">Pending</span>' : 
                                      '<span class="badge bg-danger">Cancelled</span>'}
                                </dd>
                                
                                <dt class="col-sm-4">Notes:</dt>
                                <dd class="col-sm-8">${transaction.notes || '-'}</dd>
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
        const modal = new bootstrap.Modal(document.getElementById('viewTransactionModal'));
        modal.show();
        
        document.getElementById('viewTransactionModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

function editTransaction(id) {
    const transaction = sampleTransactions.find(t => t.id === id);
    if (transaction) {
        alert('Edit functionality for transaction ' + id + ' would be implemented here.');
    }
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        const index = sampleTransactions.findIndex(t => t.id === id);
        if (index !== -1) {
            sampleTransactions.splice(index, 1);
            loadTransactionsTable();
            alert('Transaction deleted successfully!');
        }
    }
}

function exportTransactions() {
    // Convert transactions to CSV
    const headers = ['Date', 'Transaction ID', 'Type', 'Item', 'Quantity', 'From Location', 'To Location', 'Reference', 'User', 'Status'];
    const rows = sampleTransactions.map(t => [
        t.date,
        t.id,
        t.type,
        t.itemName,
        `${t.quantity} ${t.unit}`,
        t.fromLocation || '-',
        t.toLocation || '-',
        t.reference,
        t.userName,
        t.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function printTransactions() {
    const printContent = document.getElementById('transactionsTable').outerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Transactions Report - HVAC IMS</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @media print {
                    .no-print { display: none; }
                    table { font-size: 0.8rem; }
                }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <h4 class="text-center mb-4">Inventory Transactions Report</h4>
                <p class="text-center"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                ${printContent}
            </div>
        </body>
        </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
}