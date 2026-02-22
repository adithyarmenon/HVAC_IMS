// Inventory management specific functions

class InventoryManager {
    constructor() {
        this.inventoryData = {
            rawMaterials: [
                { id: 1, name: "Filter Media MERV 8", sku: "RM-FM-008", stock: 450, min: 100, max: 500, unit: "rolls", location: "Main Warehouse", status: "good" },
                { id: 2, name: "Filter Media MERV 13", sku: "RM-FM-013", stock: 50, min: 100, max: 500, unit: "rolls", location: "Main Warehouse", status: "critical" },
                { id: 3, name: "Aluminum Frames", sku: "RM-AF-001", stock: 320, min: 100, max: 500, unit: "pcs", location: "Main Warehouse", status: "good" },
                { id: 4, name: "Activated Carbon", sku: "RM-AC-001", stock: 25, min: 50, max: 200, unit: "kg", location: "Chemicals Store", status: "low" },
                { id: 5, name: "Adhesive (Type A)", sku: "RM-AD-001", stock: 5, min: 20, max: 100, unit: "liters", location: "Chemicals Store", status: "critical" },
                { id: 6, name: "Packaging Boxes", sku: "RM-PB-001", stock: 1200, min: 500, max: 2000, unit: "pcs", location: "Packaging Area", status: "good" }
            ],
            finishedGoods: [
                { id: 1, name: "Panel Filter 24x24", sku: "FG-PF-2424", type: "Panel", size: "24x24", grade: "MERV 8", stock: 150, location: "Main Warehouse", status: "good" },
                { id: 2, name: "Bag Filter 36\"", sku: "FG-BF-36", type: "Bag", size: "36\"", grade: "MERV 13", stock: 85, location: "Dispatch Area", status: "good" },
                { id: 3, name: "Pocket Filter 24x24", sku: "FG-PKF-2424", type: "Pocket", size: "24x24", grade: "MERV 11", stock: 45, location: "Main Warehouse", status: "low" },
                { id: 4, name: "V-Bank Filter", sku: "FG-VBF-2424", type: "V-Bank", size: "24x24", grade: "MERV 13", stock: 30, location: "Production Area", status: "good" },
                { id: 5, name: "Cartridge Filter", sku: "FG-CF-12", type: "Cartridge", size: "12\"", grade: "MERV 8", stock: 120, location: "Main Warehouse", status: "good" }
            ],
            warehouses: [
                { id: 1, name: "Main Warehouse", code: "WH-MAIN", area: "5000 sq ft", capacity: "High", manager: "John Doe", items: 1250 },
                { id: 2, name: "Production Area", code: "WH-PROD", area: "2000 sq ft", capacity: "Medium", manager: "Mike Johnson", items: 320 },
                { id: 3, name: "Dispatch Area", code: "WH-DISP", area: "1500 sq ft", capacity: "Medium", manager: "Sarah Smith", items: 180 },
                { id: 4, name: "Chemicals Store", code: "WH-CHEM", area: "800 sq ft", capacity: "Low", manager: "Robert Brown", items: 45 },
                { id: 5, name: "Packaging Area", code: "WH-PACK", area: "1000 sq ft", capacity: "Medium", manager: "Lisa Wang", items: 1200 }
            ]
        };
    }

    getInventorySummary() {
        const rawMaterialsCount = this.inventoryData.rawMaterials.length;
        const finishedGoodsCount = this.inventoryData.finishedGoods.length;
        const lowStockItems = this.inventoryData.rawMaterials.filter(item => 
            item.status === "low" || item.status === "critical"
        ).length;
        
        return {
            rawMaterials: rawMaterialsCount,
            finishedGoods: finishedGoodsCount,
            lowStockItems: lowStockItems,
            warehouses: this.inventoryData.warehouses.length
        };
    }

    updateStock(itemId, quantity, type = "raw") {
        const items = type === "raw" ? this.inventoryData.rawMaterials : this.inventoryData.finishedGoods;
        const item = items.find(i => i.id === itemId);
        
        if (item) {
            item.stock += quantity;
            
            // Update status based on stock level
            const percentage = (item.stock / item.max) * 100;
            if (percentage <= 20) {
                item.status = "critical";
            } else if (percentage <= 40) {
                item.status = "low";
            } else {
                item.status = "good";
            }
            
            return true;
        }
        return false;
    }

    getLowStockAlerts() {
        return this.inventoryData.rawMaterials.filter(item => 
            item.status === "low" || item.status === "critical"
        );
    }

    searchInventory(query) {
        query = query.toLowerCase();
        const results = {
            rawMaterials: this.inventoryData.rawMaterials.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.sku.toLowerCase().includes(query)
            ),
            finishedGoods: this.inventoryData.finishedGoods.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.sku.toLowerCase().includes(query)
            )
        };
        return results;
    }
}

// Initialize inventory manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.inventoryManager = new InventoryManager();
    
    // Update dashboard with real data
    updateDashboardWithInventoryData();
});

function updateDashboardWithInventoryData() {
    const summary = inventoryManager.getInventorySummary();
    
    // Update summary cards
    document.querySelector('.card.text-white.bg-primary .card-text').textContent = summary.rawMaterials;
    document.querySelector('.card.text-white.bg-success .card-text').textContent = summary.finishedGoods;
    document.querySelector('.card.text-white.bg-warning .card-text').textContent = summary.lowStockItems;
    
    // Update low stock alerts in sidebar
    updateLowStockAlerts();
}

function updateLowStockAlerts() {
    const lowStockItems = inventoryManager.getLowStockAlerts();
    const alertsContainer = document.querySelector('.card.mt-4 .card-body');
    
    if (alertsContainer && lowStockItems.length > 0) {
        alertsContainer.innerHTML = '';
        lowStockItems.forEach(item => {
            const alertClass = item.status === 'critical' ? 'alert-danger' : 'alert-warning';
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert ${alertClass} p-2 mb-2`;
            alertDiv.innerHTML = `
                <small>
                    <strong>${item.name}</strong><br>
                    Current: ${item.stock} ${item.unit}<br>
                    Min: ${item.min} ${item.unit}
                </small>
            `;
            alertsContainer.appendChild(alertDiv);
        });
    }
}

// Export functionality
function exportToCSV(dataType) {
    let data, filename;
    
    if (dataType === 'raw') {
        data = inventoryManager.inventoryData.rawMaterials;
        filename = 'raw-materials-inventory.csv';
    } else if (dataType === 'finished') {
        data = inventoryManager.inventoryData.finishedGoods;
        filename = 'finished-goods-inventory.csv';
    } else {
        data = [];
        filename = 'inventory.csv';
    }
    
    if (data.length === 0) return;
    
    // Convert to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification(`${filename} downloaded successfully`, 'success');
}

// Print inventory report
function printInventoryReport() {
    const printContent = document.getElementById('content-area').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Inventory Report - HVAC IMS</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @media print {
                    .no-print { display: none; }
                    h1 { font-size: 1.5rem; }
                    .card { border: 1px solid #ddd; }
                }
            </style>
        </head>
        <body>
            <div class="container mt-4">
                <h1 class="text-center mb-4">Inventory Management System Report</h1>
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