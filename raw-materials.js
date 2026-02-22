// Raw Materials Page JavaScript

// Sample raw materials data
const sampleRawMaterials = [
    { id: 1, sku: 'RM-FM-008', name: 'Filter Media MERV 8', stock: 450, unit: 'rolls', min: 100, max: 500, location: 'Main Warehouse', status: 'good' },
    { id: 2, sku: 'RM-FM-013', name: 'Filter Media MERV 13', stock: 50, unit: 'rolls', min: 100, max: 500, location: 'Main Warehouse', status: 'critical' },
    { id: 3, sku: 'RM-AF-001', name: 'Aluminum Frames', stock: 320, unit: 'pcs', min: 100, max: 500, location: 'Main Warehouse', status: 'good' },
    { id: 4, sku: 'RM-AC-001', name: 'Activated Carbon', stock: 25, unit: 'kg', min: 50, max: 200, location: 'Chemicals Store', status: 'low' },
    { id: 5, sku: 'RM-AD-001', name: 'Adhesive Type A', stock: 5, unit: 'liters', min: 20, max: 100, location: 'Chemicals Store', status: 'critical' },
    { id: 6, sku: 'RM-PB-001', name: 'Packaging Boxes', stock: 1200, unit: 'boxes', min: 500, max: 2000, location: 'Packaging Area', status: 'good' }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
    
    // Load the table
    loadRawMaterialsTable();
    
    // Setup event listeners for filters
    const searchInput = document.getElementById('searchRawMaterials');
    if (searchInput) {
        searchInput.addEventListener('input', filterRawMaterials);
    }
    
    const warehouseFilter = document.getElementById('filterWarehouse');
    if (warehouseFilter) {
        warehouseFilter.addEventListener('change', filterRawMaterials);
    }
    
    const statusFilter = document.getElementById('filterStatus');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterRawMaterials);
    }
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
    }
}

// Load raw materials table
function loadRawMaterialsTable() {
    const tableBody = document.getElementById('rawMaterialsTableBody');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Use sample data
    const rawMaterials = sampleRawMaterials;
    
    // Check if table is empty
    if (rawMaterials.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center">No raw materials found</td></tr>';
        return;
    }
    
    // Populate table
    rawMaterials.forEach(material => {
        const row = document.createElement('tr');
        
        // Determine status badge
        const statusBadge = getStatusBadge(material.status);
        
        row.innerHTML = `
            <td>${material.sku}</td>
            <td>${material.name}</td>
            <td>${material.stock}</td>
            <td>${material.unit}</td>
            <td>${material.min}</td>
            <td>${material.max}</td>
            <td>${material.location}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewMaterial(${material.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editMaterial(${material.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMaterial(${material.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const badges = {
        'critical': '<span class="badge bg-danger">Critical</span>',
        'low': '<span class="badge bg-warning">Low</span>',
        'good': '<span class="badge bg-success">Good</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">Unknown</span>';
}

// Filter raw materials
function filterRawMaterials() {
    const searchTerm = document.getElementById('searchRawMaterials')?.value.toLowerCase() || '';
    const warehouseFilter = document.getElementById('filterWarehouse')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    
    const rows = document.querySelectorAll('#rawMaterialsTableBody tr');
    
    rows.forEach(row => {
        // Skip if it's the "no data" row
        if (row.cells.length === 1) return;
        
        const name = row.cells[1]?.textContent.toLowerCase() || '';
        const warehouse = row.cells[6]?.textContent.toLowerCase() || '';
        const status = row.cells[7]?.querySelector('.badge')?.textContent.toLowerCase() || '';
        
        let showRow = true;
        
        // Search filter
        if (searchTerm && !name.includes(searchTerm)) {
            showRow = false;
        }
        
        // Warehouse filter
        if (warehouseFilter) {
            const warehouseMap = {
                'main': 'main warehouse',
                'production': 'production area',
                'chemical': 'chemicals store',
                'packaging': 'packaging area'
            };
            const filterValue = warehouseMap[warehouseFilter] || warehouseFilter.toLowerCase();
            if (!warehouse.includes(filterValue)) {
                showRow = false;
            }
        }
        
        // Status filter
        if (statusFilter && !status.includes(statusFilter)) {
            showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

// Reset all filters
function resetFilters() {
    const searchInput = document.getElementById('searchRawMaterials');
    const warehouseFilter = document.getElementById('filterWarehouse');
    const statusFilter = document.getElementById('filterStatus');
    
    if (searchInput) searchInput.value = '';
    if (warehouseFilter) warehouseFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    
    filterRawMaterials();
}

// Save new raw material
function saveRawMaterial() {
    // Get form values
    const materialCode = document.getElementById('materialCode')?.value;
    const materialName = document.getElementById('materialName')?.value;
    const unit = document.getElementById('unit')?.value;
    const initialStock = parseInt(document.getElementById('initialStock')?.value) || 0;
    const minLevel = parseInt(document.getElementById('minLevel')?.value);
    const maxLevel = parseInt(document.getElementById('maxLevel')?.value);
    const warehouse = document.getElementById('warehouse')?.value;
    const description = document.getElementById('description')?.value;
    
    // Validate
    if (!materialCode || !materialName || !unit || isNaN(minLevel) || isNaN(maxLevel) || !warehouse) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Create new material object
    const newMaterial = {
        id: Date.now(), // Use timestamp as ID
        name: materialName,
        sku: materialCode.toUpperCase(),
        stock: initialStock,
        min: minLevel,
        max: maxLevel,
        unit: unit,
        location: formatLocationName(warehouse),
        status: initialStock <= minLevel ? 'critical' : (initialStock <= minLevel * 1.5 ? 'low' : 'good')
    };
    
    // Add to sample data
    sampleRawMaterials.push(newMaterial);
    
    // Update table
    loadRawMaterialsTable();
    
    // Close modal and reset form
    const modalElement = document.getElementById('addRawMaterialModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
    
    const form = document.getElementById('addRawMaterialForm');
    if (form) form.reset();
    
    // Show success message
    showNotification('Raw material added successfully!', 'success');
}

// Format location name
function formatLocationName(warehouse) {
    const locations = {
        'main': 'Main Warehouse',
        'production': 'Production Area',
        'chemical': 'Chemicals Store',
        'packaging': 'Packaging Area'
    };
    return locations[warehouse] || warehouse;
}

// View material details
function viewMaterial(id) {
    const material = sampleRawMaterials.find(m => m.id === id);
    if (!material) return;
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="viewMaterialModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Material Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <dl class="row">
                            <dt class="col-sm-4">Material Code:</dt>
                            <dd class="col-sm-8">${material.sku}</dd>
                            
                            <dt class="col-sm-4">Name:</dt>
                            <dd class="col-sm-8">${material.name}</dd>
                            
                            <dt class="col-sm-4">Current Stock:</dt>
                            <dd class="col-sm-8">${material.stock} ${material.unit}</dd>
                            
                            <dt class="col-sm-4">Stock Levels:</dt>
                            <dd class="col-sm-8">Min: ${material.min} | Max: ${material.max} ${material.unit}</dd>
                            
                            <dt class="col-sm-4">Location:</dt>
                            <dd class="col-sm-8">${material.location}</dd>
                            
                            <dt class="col-sm-4">Status:</dt>
                            <dd class="col-sm-8">${getStatusBadge(material.status)}</dd>
                        </dl>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewMaterialModal'));
    modal.show();
    
    // Remove modal from DOM after hiding
    document.getElementById('viewMaterialModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Edit material
function editMaterial(id) {
    const material = sampleRawMaterials.find(m => m.id === id);
    if (!material) return;
    
    // Pre-fill form with material data
    const materialCode = document.getElementById('materialCode');
    const materialName = document.getElementById('materialName');
    const unit = document.getElementById('unit');
    const initialStock = document.getElementById('initialStock');
    const minLevel = document.getElementById('minLevel');
    const maxLevel = document.getElementById('maxLevel');
    
    if (materialCode) materialCode.value = material.sku;
    if (materialName) materialName.value = material.name;
    if (unit) unit.value = material.unit;
    if (initialStock) initialStock.value = material.stock;
    if (minLevel) minLevel.value = material.min;
    if (maxLevel) maxLevel.value = material.max;
    
    // Set warehouse select
    const warehouseMap = {
        'Main Warehouse': 'main',
        'Production Area': 'production',
        'Chemicals Store': 'chemical',
        'Packaging Area': 'packaging'
    };
    
    const warehouse = document.getElementById('warehouse');
    if (warehouse) {
        warehouse.value = warehouseMap[material.location] || '';
    }
    
    // Show modal
    const modalElement = document.getElementById('addRawMaterialModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // Change button text and action
        const saveBtn = document.querySelector('#addRawMaterialModal .btn-primary');
        if (saveBtn) {
            saveBtn.textContent = 'Update Material';
            saveBtn.onclick = function() { updateMaterial(id); };
        }
    }
}

// Update material
function updateMaterial(id) {
    // Get form values
    const materialCode = document.getElementById('materialCode')?.value;
    const materialName = document.getElementById('materialName')?.value;
    const unit = document.getElementById('unit')?.value;
    const stock = parseInt(document.getElementById('initialStock')?.value) || 0;
    const minLevel = parseInt(document.getElementById('minLevel')?.value);
    const maxLevel = parseInt(document.getElementById('maxLevel')?.value);
    const warehouse = document.getElementById('warehouse')?.value;
    
    // Find material index
    const index = sampleRawMaterials.findIndex(m => m.id === id);
    if (index === -1) return;
    
    // Update material
    sampleRawMaterials[index] = {
        ...sampleRawMaterials[index],
        name: materialName,
        sku: materialCode.toUpperCase(),
        stock: stock,
        min: minLevel,
        max: maxLevel,
        unit: unit,
        location: formatLocationName(warehouse),
        status: stock <= minLevel ? 'critical' : (stock <= minLevel * 1.5 ? 'low' : 'good')
    };
    
    // Reload table
    loadRawMaterialsTable();
    
    // Close modal
    const modalElement = document.getElementById('addRawMaterialModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
    }
    
    // Reset button
    const saveBtn = document.querySelector('#addRawMaterialModal .btn-primary');
    if (saveBtn) {
        saveBtn.textContent = 'Save Material';
        saveBtn.onclick = saveRawMaterial;
    }
    
    // Show success message
    showNotification('Material updated successfully!', 'success');
}

// Delete material
function deleteMaterial(id) {
    if (confirm('Are you sure you want to delete this raw material?')) {
        const index = sampleRawMaterials.findIndex(m => m.id === id);
        if (index !== -1) {
            sampleRawMaterials.splice(index, 1);
            loadRawMaterialsTable();
            showNotification('Raw material deleted successfully!', 'success');
        }
    }
}

// Show notification
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Export to CSV
function exportToCSV() {
    let csv = 'SKU,Name,Stock,Unit,Min Level,Max Level,Location,Status\n';
    
    sampleRawMaterials.forEach(m => {
        csv += `${m.sku},${m.name},${m.stock},${m.unit},${m.min},${m.max},${m.location},${m.status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raw-materials-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Print table
function printTable() {
    window.print();
}