const path = require('path');

console.log('Testing from server perspective...');
console.log('Current dir:', __dirname);

// Try different require paths
try {
    // Method 1: Relative path
    const User1 = require('./models/User');
    console.log('✓ Method 1 works: ./models/User');
} catch (e) {
    console.log('✗ Method 1 failed:', e.message);
}

try {
    // Method 2: From controllers perspective
    const controllerPath = path.join(__dirname, 'controllers', 'auth.controller.js');
    console.log('Controller path:', controllerPath);
    
    // Simulate what auth.controller.js would do
    const modelsPath = path.join(__dirname, 'models', 'User');
    console.log('Models path to require:', modelsPath);
    
    const User2 = require(modelsPath);
    console.log('✓ Method 2 works: absolute path');
} catch (e) {
    console.log('✗ Method 2 failed:', e.message);
}
