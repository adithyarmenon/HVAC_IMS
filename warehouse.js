// Warehouse Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadWarehouseCards();
    loadWarehouseTable();
});

function loadWarehouseCards() {
    const container = document.getElementById('warehouseCards');
    const warehouses = window.inventoryManager.inventoryData.warehouses;
    
    container.innerHTML = '';
    
    warehouses.forEach(warehouse => {
        const capacityPercentage = Math.min(100, Math.round((warehouse.items / 1500) * 100));
        const capacityColor = capacityPercentage > 80 ? 'danger' : capacityPercentage > 60 ? 'warning' : 'success';
        
        const cardHTML = `
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title">${warehouse.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${warehouse.code}</h6>
                            </div>
                            <span class="badge bg-${capacityColor}">${capacityPercentage}% Full</span>
                        </div>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="bi bi-rulers me-1"></i> ${warehouse.area}<br>
                                <i class="bi bi-person me-1"></i> ${warehouse.manager}<br>
                                <i class="bi bi-box me-1"></i> ${warehouse.items} items
                            </small>
                        </p>
                        <div class="progress mb-2" style="height: 10px;">
                            <div class="progress-bar bg-${capacityColor}" style="width: ${capacityPercentage}%"></div>
                        </div>
                        <button class="btn btn-sm btn-outline-primary w-100" onclick="viewWarehouse(${warehouse.id})">
                            <i class="bi bi-eye"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function loadWarehouseTable() {
    const tableBody = document.getElementById('warehouseTableBody');
    const warehouses = window.inventoryManager.inventoryData.warehouses;
    
    tableBody.innerHTML = '';
    
    warehouses.forEach(warehouse => {
        const capacityPercentage = Math.min(100, Math.round((warehouse.items / 1500) * 100));
        const capacityColor = capacityPercentage > 80 ? 'danger' : capacityPercentage > 60 ? 'warning' : 'success';
        const statusBadge = capacityPercentage > 80 
            ? '<span class="badge bg-danger">Full</span>' 
            : capacityPercentage > 60 
            ? '<span class="badge bg-warning">Moderate</span>' 
            : '<span class="badge bg-success">Available</span>';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${warehouse.name}</td>
            <td>${warehouse.code}</td>
            <td>${warehouse.area}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 10px;">
                        <div class="progress-bar bg-${capacityColor}" style="width: ${capacityPercentage}%"></div>
                    </div>
                    <small>${capacityPercentage}%</small>
                </div>
            </td>
            <td>${warehouse.manager}</td>
            <td>${warehouse.items}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewWarehouse(${warehouse.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editWarehouse(${warehouse.id})">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function showAddWarehouseModal() {
    const modalHTML = `
        <div class="modal fade" id="addWarehouseModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Warehouse</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addWarehouseForm">
                            <div class="mb-3">
                                <label for="warehouseName" class="form-label">Warehouse Name</label>
                                <input type="text" class="form-control" id="warehouseName" required>
                            </div>
                            <div class="mb-3">
                                <label for="warehouseCode" class="form-label">Warehouse Code</label>
                                <input type="text" class="form-control" id="warehouseCode" required>
                            </div>
                            <div class="mb-3">
                                <label for="warehouseArea" class="form-label">Area</label>
                                <input type="text" class="form-control" id="warehouseArea" placeholder="e.g., 5000 sq ft" required>
                            </div>
                            <div class="mb-3">
                                <label for="warehouseManager" class="form-label">Manager</label>
                                <input type="text" class="form-control" id="warehouseManager" required>
                            </div>
                            <div class="mb-3">
                                <label for="warehouseCapacity" class="form-label">Capacity (items)</label>
                                <input type="number" class="form-control" id="warehouseCapacity" value="1500" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveWarehouse()">Save Warehouse</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('addWarehouseModal'));
    modal.show();
    
    document.getElementById('addWarehouseModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function saveWarehouse() {
    const name = document.getElementById('warehouseName').value;
    const code = document.getElementById('warehouseCode').value;
    const area = document.getElementById('warehouseArea').value;
    const manager = document.getElementById('warehouseManager').value;
    const capacity = parseInt(document.getElementById('warehouseCapacity').value);
    
    if (!name || !code || !area || !manager) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const newWarehouse = {
        id: Date.now(),
        name: name,
        code: code,
        area: area,
        capacity: 'High',
        manager: manager,
        items: 0
    };
    
    window.inventoryManager.inventoryData.warehouses.push(newWarehouse);
    loadWarehouseCards();
    loadWarehouseTable();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addWarehouseModal'));
    modal.hide();
    
    alert('Warehouse added successfully!');
}

function viewWarehouse(id) {
    const warehouse = window.inventoryManager.inventoryData.warehouses.find(w => w.id === id);
    if (warehouse) {
        // Get items in this warehouse
        const rawMaterials = window.inventoryManager.inventoryData.rawMaterials
            .filter(item => item.location.includes(warehouse.name))
            .map(item => `${item.name} (${item.stock} ${item.unit})`);
        
        const finishedGoods = window.inventoryManager.inventoryData.finishedGoods
            .filter(item => item.location.includes(warehouse.name))
            .map(item => `${item.name} (${item.stock} pcs)`);
        
        const modalHTML = `
            <div class="modal fade" id="viewWarehouseModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${warehouse.name} - Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <dl class="row">
                                        <dt class="col-sm-4">Code:</dt>
                                        <dd class="col-sm-8">${warehouse.code}</dd>
                                        
                                        <dt class="col-sm-4">Area:</dt>
                                        <dd class="col-sm-8">${warehouse.area}</dd>
                                        
                                        <dt class="col-sm-4">Manager:</dt>
                                        <dd class="col-sm-8">${warehouse.manager}</dd>
                                        
                                        <dt class="col-sm-4">Capacity:</dt>
                                        <dd class="col-sm-8">${warehouse.capacity}</dd>
                                        
                                        <dt class="col-sm-4">Total Items:</dt>
                                        <dd class="col-sm-8">${warehouse.items}</dd>
                                    </dl>
                                </div>
                                <div class="col-md-6">
                                    <h6>Raw Materials</h6>
                                    <ul class="list-group mb-3">
                                        ${rawMaterials.length > 0 
                                            ? rawMaterials.map(item => `<li class="list-group-item">${item}</li>`).join('')
                                            : '<li class="list-group-item text-muted">No raw materials</li>'}
                                    </ul>
                                    
                                    <h6>Finished Goods</h6>
                                    <ul class="list-group">
                                        ${finishedGoods.length > 0 
                                            ? finishedGoods.map(item => `<li class="list-group-item">${item}</li>`).join('')
                                            : '<li class="list-group-item text-muted">No finished goods</li>'}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('viewWarehouseModal'));
        modal.show();
        
        document.getElementById('viewWarehouseModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

function editWarehouse(id) {
    alert('Edit warehouse functionality would be implemented here.');
}