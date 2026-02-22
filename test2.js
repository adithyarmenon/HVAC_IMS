console.log('Testing require...');
try {
    const User = require('./models/User');
    console.log('✓ User model loaded successfully');
    console.log('Model structure:', Object.keys(User));
} catch (error) {
    console.log('✗ Error loading User model:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Full error:', error);
}
