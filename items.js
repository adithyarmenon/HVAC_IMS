// Items Master JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadItemsTable();
    
    // Setup event listeners for filters
    document.getElementById('searchItems').addEventListener('input', filterItems);
    document.getElementById('filterCategory').addEventListener('change', filterItems);
    document.getElementById('filterStatus').addEventListener('change', filterItems);
});

// Sample items data
const sampleItems = [
    {
        id: 1,
        sku: 'RM-FM-008',
        name: 'Filter Media MERV 8',
        category: 'raw',
        unit: 'rolls',
        min: 100,
        max: 500,
        location: 'Main Warehouse',
        status: 'active',
        description: 'Basic filter media for standard filters'
    },
    {
        id: 2,
        sku: 'RM-FM-013',
        name: 'Filter Media MERV 13',
        category: 'raw',
        unit: 'rolls',
        min: 100,
        max: 500,
        location: 'Main Warehouse',
        status: 'active',
        description: 'High-efficiency filter media'
    },
    {
        id: 3,
        sku: 'RM-AF-001',
        name: 'Aluminum Frames',
        category: 'raw',
        unit: 'pcs',
        min: 100,
        max: 500,
        location: 'Main Warehouse',
        status: 'active',
        description: 'Aluminum frames for panel filters'
    },
    {
        id: 4,
        sku: 'FG-PF-2424',
        name: 'Panel Filter 24x24',
        category: 'finished',
        unit: 'pcs',
        min: 25,
        max: 200,
        location: 'Dispatch Area',
        status: 'active',
        description: 'Standard panel filter'
    },
    {
        id: 5,
        sku: 'FG-BF-36',
        name: 'Bag Filter 36"',
        category: 'finished',
        unit: 'pcs',
        min: 15,
        max: 100,
        location: 'Dispatch Area',
        status: 'active',
        description: 'Bag filter for industrial applications'
    },
    {
        id: 6,
        sku: 'RM-AD-001',
        name: 'Adhesive (Type A)',
        category: 'consumable',
        unit: 'liters',
        min: 20,
        max: 100,
        location: 'Chemicals Store',
        status: 'active',
        description: 'Adhesive for filter assembly'
    },
    {
        id: 7,
        sku: 'RM-PB-001',
        name: 'Packaging Boxes',
        category: 'packaging',
        unit: 'boxes',
        min: 500,
        max: 2000,
        location: 'Packaging Area',
        status: 'active',
        description: 'Corrugated boxes for filter packaging'
    }
];

function loadItemsTable() {
    const tableBody = document.getElementById('itemsTableBody');
    tableBody.innerHTML = '';
    
    sampleItems.forEach(item => {
        const categoryBadge = getCategoryBadge(item.category);
        const statusBadge = item.status === 'active' 
            ? '<span class="badge bg-success">Active</span>' 
            : '<span class="badge bg-secondary">Inactive</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.sku}</td>
            <td>${item.name}</td>
            <td>${categoryBadge}</td>
            <td>${item.unit}</td>
            <td>${item.min}</td>
            <td>${item.max}</td>
            <td>${item.location}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewItem(${item.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editItem(${item.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getCategoryBadge(category) {
    const badges = {
        'raw': '<span class="badge bg-primary">Raw Material</span>',
        'finished': '<span class="badge bg-success">Finished Goods</span>',
        'consumable': '<span class="badge bg-warning">Consumable</span>',
        'packaging': '<span class="badge bg-info">Packaging</span>'
    };
    return badges[category] || '<span class="badge bg-secondary">Other</span>';
}

function filterItems() {
    const searchTerm = document.getElementById('searchItems').value.toLowerCase();
    const categoryFilter = document.getElementById('filterCategory').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    const rows = document.querySelectorAll('#itemsTableBody tr');
    
    rows.forEach(row => {
        const cells = row.cells;
        const sku = cells[0].textContent.toLowerCase();
        const name = cells[1].textContent.toLowerCase();
        const category = cells[2].querySelector('.badge').textContent.toLowerCase();
        const status = cells[7].querySelector('.badge').textContent.toLowerCase();
        
        let showRow = true;
        
        if (searchTerm && !sku.includes(searchTerm) && !name.includes(searchTerm)) {
            showRow = false;
        }
        
        if (categoryFilter) {
            const categoryMap = {
                'raw': 'raw material',
                'finished': 'finished goods',
                'consumable': 'consumable',
                'packaging': 'packaging'
            };
            if (!category.includes(categoryMap[categoryFilter] || categoryFilter)) {
                showRow = false;
            }
        }
        
        if (statusFilter && !status.includes(statusFilter)) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function saveItem() {
    const category = document.getElementById('itemCategory').value;
    const sku = document.getElementById('itemSKU').value;
    const name = document.getElementById('itemName').value;
    const unit = document.getElementById('itemUnit').value;
    const location = document.getElementById('itemLocation').value;
    const min = parseInt(document.getElementById('itemMin').value);
    const max = parseInt(document.getElementById('itemMax').value);
    const description = document.getElementById('itemDescription').value;
    
    if (!category || !sku || !name || !unit || !location || isNaN(min) || isNaN(max)) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const newItem = {
        id: Date.now(),
        sku: sku,
        name: name,
        category: category,
        unit: unit,
        min: min,
        max: max,
        location: location,
        status: 'active',
        description: description
    };
    
    sampleItems.push(newItem);
    loadItemsTable();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
    modal.hide();
    document.getElementById('addItemForm').reset();
    
    alert('Item added successfully!');
}

function viewItem(id) {
    const item = sampleItems.find(i => i.id === id);
    if (item) {
        const modalHTML = `
            <div class="modal fade" id="viewItemModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Item Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <dl class="row">
                                <dt class="col-sm-4">SKU:</dt>
                                <dd class="col-sm-8">${item.sku}</dd>
                                
                                <dt class="col-sm-4">Name:</dt>
                                <dd class="col-sm-8">${item.name}</dd>
                                
                                <dt class="col-sm-4">Category:</dt>
                                <dd class="col-sm-8">${getCategoryBadge(item.category)}</dd>
                                
                                <dt class="col-sm-4">Unit:</dt>
                                <dd class="col-sm-8">${item.unit}</dd>
                                
                                <dt class="col-sm-4">Stock Levels:</dt>
                                <dd class="col-sm-8">Min: ${item.min} | Max: ${item.max}</dd>
                                
                                <dt class="col-sm-4">Default Location:</dt>
                                <dd class="col-sm-8">${item.location}</dd>
                                
                                <dt class="col-sm-4">Status:</dt>
                                <dd class="col-sm-8">${item.status === 'active' ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>'}</dd>
                                
                                <dt class="col-sm-4">Description:</dt>
                                <dd class="col-sm-8">${item.description || 'No description'}</dd>
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
        const modal = new bootstrap.Modal(document.getElementById('viewItemModal'));
        modal.show();
        
        document.getElementById('viewItemModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

function editItem(id) {
    const item = sampleItems.find(i => i.id === id);
    if (item) {
        // Pre-fill form
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemSKU').value = item.sku;
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemUnit').value = item.unit;
        document.getElementById('itemLocation').value = item.location;
        document.getElementById('itemMin').value = item.min;
        document.getElementById('itemMax').value = item.max;
        document.getElementById('itemDescription').value = item.description;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        modal.show();
        
        // Update button action
        const saveBtn = document.querySelector('#addItemModal .btn-primary');
        saveBtn.textContent = 'Update Item';
        saveBtn.onclick = function() { updateItem(id); };
    }
}

function updateItem(id) {
    alert('Update functionality for item ' + id + ' would be implemented here.');
}

function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const index = sampleItems.findIndex(i => i.id === id);
        if (index !== -1) {
            sampleItems.splice(index, 1);
            loadItemsTable();
            alert('Item deleted successfully!');
        }
    }
}