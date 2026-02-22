// Locations Master JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadLocationCards();
    loadLocationsTable();
    
    // Setup event listeners for filters
    document.getElementById('searchLocations').addEventListener('input', filterLocations);
    document.getElementById('filterType').addEventListener('change', filterLocations);
});

// Sample locations data
const sampleLocations = [
    {
        id: 1,
        code: 'WH-MAIN',
        name: 'Main Warehouse',
        type: 'warehouse',
        area: '5000 sq ft',
        capacity: 1500,
        manager: 'John Doe',
        description: 'Primary storage warehouse',
        status: 'active',
        items: 1250
    },
    {
        id: 2,
        code: 'WH-PROD',
        name: 'Production Area',
        type: 'production',
        area: '2000 sq ft',
        capacity: 800,
        manager: 'Mike Johnson',
        description: 'Manufacturing and assembly area',
        status: 'active',
        items: 320
    },
    {
        id: 3,
        code: 'WH-DISP',
        name: 'Dispatch Area',
        type: 'dispatch',
        area: '1500 sq ft',
        capacity: 600,
        manager: 'Sarah Smith',
        description: 'Finished goods dispatch area',
        status: 'active',
        items: 180
    },
    {
        id: 4,
        code: 'WH-CHEM',
        name: 'Chemicals Store',
        type: 'store',
        area: '800 sq ft',
        capacity: 300,
        manager: 'Robert Brown',
        description: 'Storage for chemicals and adhesives',
        status: 'active',
        items: 45
    },
    {
        id: 5,
        code: 'WH-PACK',
        name: 'Packaging Area',
        type: 'production',
        area: '1000 sq ft',
        capacity: 500,
        manager: 'Lisa Wang',
        description: 'Packaging and labeling area',
        status: 'active',
        items: 1200
    }
];

function loadLocationCards() {
    const container = document.getElementById('locationCards');
    container.innerHTML = '';
    
    sampleLocations.forEach(location => {
        const capacityPercentage = Math.min(100, Math.round((location.items / location.capacity) * 100));
        const capacityColor = capacityPercentage > 80 ? 'danger' : capacityPercentage > 60 ? 'warning' : 'success';
        const typeIcon = getTypeIcon(location.type);
        
        const cardHTML = `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title">${location.name}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${location.code}</h6>
                            </div>
                            <i class="bi ${typeIcon} display-6 text-primary"></i>
                        </div>
                        <p class="card-text">
                            <small class="text-muted">
                                <i class="bi bi-rulers me-1"></i> ${location.area}<br>
                                <i class="bi bi-person me-1"></i> ${location.manager}<br>
                                <i class="bi bi-box me-1"></i> ${location.items} items
                            </small>
                        </p>
                        <div class="progress mb-2" style="height: 10px;">
                            <div class="progress-bar bg-${capacityColor}" style="width: ${capacityPercentage}%"></div>
                        </div>
                        <small class="text-muted">Capacity: ${location.items}/${location.capacity} items (${capacityPercentage}%)</small>
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function getTypeIcon(type) {
    const icons = {
        'warehouse': 'bi-building',
        'production': 'bi-gear',
        'dispatch': 'bi-truck',
        'store': 'bi-box-seam'
    };
    return icons[type] || 'bi-geo-alt';
}

function loadLocationsTable() {
    const tableBody = document.getElementById('locationsTableBody');
    tableBody.innerHTML = '';
    
    sampleLocations.forEach(location => {
        const typeBadge = getTypeBadge(location.type);
        const statusBadge = location.status === 'active' 
            ? '<span class="badge bg-success">Active</span>' 
            : '<span class="badge bg-secondary">Inactive</span>';
        
        const capacityPercentage = Math.min(100, Math.round((location.items / location.capacity) * 100));
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${location.code}</td>
            <td>${location.name}</td>
            <td>${typeBadge}</td>
            <td>${location.area}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1 me-2" style="height: 8px;">
                        <div class="progress-bar ${capacityPercentage > 80 ? 'bg-danger' : capacityPercentage > 60 ? 'bg-warning' : 'bg-success'}" 
                             style="width: ${capacityPercentage}%"></div>
                    </div>
                    <small>${capacityPercentage}%</small>
                </div>
            </td>
            <td>${location.manager}</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewLocation(${location.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="editLocation(${location.id})">
                    <i class="bi bi-pencil"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getTypeBadge(type) {
    const badges = {
        'warehouse': '<span class="badge bg-primary">Warehouse</span>',
        'production': '<span class="badge bg-success">Production</span>',
        'dispatch': '<span class="badge bg-info">Dispatch</span>',
        'store': '<span class="badge bg-warning">Store</span>'
    };
    return badges[type] || '<span class="badge bg-secondary">Other</span>';
}

function filterLocations() {
    const searchTerm = document.getElementById('searchLocations').value.toLowerCase();
    const typeFilter = document.getElementById('filterType').value;
    
    const cards = document.querySelectorAll('#locationCards .col-md-4');
    const rows = document.querySelectorAll('#locationsTableBody tr');
    
    cards.forEach(card => {
        const name = card.querySelector('.card-title').textContent.toLowerCase();
        const code = card.querySelector('.card-subtitle').textContent.toLowerCase();
        
        let showCard = true;
        
        if (searchTerm && !name.includes(searchTerm) && !code.includes(searchTerm)) {
            showCard = false;
        }
        
        card.style.display = showCard ? '' : 'none';
    });
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const code = row.cells[0].textContent.toLowerCase();
        const type = row.cells[2].querySelector('.badge').textContent.toLowerCase();
        
        let showRow = true;
        
        if (searchTerm && !name.includes(searchTerm) && !code.includes(searchTerm)) {
            showRow = false;
        }
        
        if (typeFilter) {
            const typeMap = {
                'warehouse': 'warehouse',
                'production': 'production',
                'dispatch': 'dispatch',
                'store': 'store room'
            };
            if (!type.includes(typeMap[typeFilter] || typeFilter)) {
                showRow = false;
            }
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}

function saveLocation() {
    const code = document.getElementById('locationCode').value;
    const name = document.getElementById('locationName').value;
    const type = document.getElementById('locationType').value;
    const area = document.getElementById('locationArea').value;
    const capacity = parseInt(document.getElementById('locationCapacity').value);
    const manager = document.getElementById('locationManager').value;
    const description = document.getElementById('locationDescription').value;
    
    if (!code || !name || !type) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const newLocation = {
        id: Date.now(),
        code: code,
        name: name,
        type: type,
        area: area || 'Not specified',
        capacity: capacity || 1000,
        manager: manager || 'Not assigned',
        description: description,
        status: 'active',
        items: 0
    };
    
    sampleLocations.push(newLocation);
    loadLocationCards();
    loadLocationsTable();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addLocationModal'));
    modal.hide();
    document.getElementById('addLocationForm').reset();
    
    alert('Location added successfully!');
}

function viewLocation(id) {
    const location = sampleLocations.find(l => l.id === id);
    if (location) {
        const modalHTML = `
            <div class="modal fade" id="viewLocationModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Location Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <dl class="row">
                                <dt class="col-sm-4">Code:</dt>
                                <dd class="col-sm-8">${location.code}</dd>
                                
                                <dt class="col-sm-4">Name:</dt>
                                <dd class="col-sm-8">${location.name}</dd>
                                
                                <dt class="col-sm-4">Type:</dt>
                                <dd class="col-sm-8">${getTypeBadge(location.type)}</dd>
                                
                                <dt class="col-sm-4">Area:</dt>
                                <dd class="col-sm-8">${location.area}</dd>
                                
                                <dt class="col-sm-4">Capacity:</dt>
                                <dd class="col-sm-8">${location.capacity} items</dd>
                                
                                <dt class="col-sm-4">Current Items:</dt>
                                <dd class="col-sm-8">${location.items} items</dd>
                                
                                <dt class="col-sm-4">Manager:</dt>
                                <dd class="col-sm-8">${location.manager}</dd>
                                
                                <dt class="col-sm-4">Status:</dt>
                                <dd class="col-sm-8">${location.status === 'active' ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Inactive</span>'}</dd>
                                
                                <dt class="col-sm-4">Description:</dt>
                                <dd class="col-sm-8">${location.description || 'No description'}</dd>
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
        const modal = new bootstrap.Modal(document.getElementById('viewLocationModal'));
        modal.show();
        
        document.getElementById('viewLocationModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

function editLocation(id) {
    const location = sampleLocations.find(l => l.id === id);
    if (location) {
        // Pre-fill form
        document.getElementById('locationCode').value = location.code;
        document.getElementById('locationName').value = location.name;
        document.getElementById('locationType').value = location.type;
        document.getElementById('locationArea').value = location.area;
        document.getElementById('locationCapacity').value = location.capacity;
        document.getElementById('locationManager').value = location.manager;
        document.getElementById('locationDescription').value = location.description;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addLocationModal'));
        modal.show();
        
        // Update button action
        const saveBtn = document.querySelector('#addLocationModal .btn-primary');
        saveBtn.textContent = 'Update Location';
        saveBtn.onclick = function() { updateLocation(id); };
    }
}

function updateLocation(id) {
    alert('Update functionality for location ' + id + ' would be implemented here.');
}