const path = require('path');
const fs = require('fs');

console.log('Current directory:', __dirname);
console.log('Trying to require User model...');

try {
    const userPath = path.join(__dirname, 'models', 'User.js');
    console.log('Looking for file at:', userPath);
    console.log('File exists?', fs.existsSync(userPath));
    
    if (fs.existsSync(userPath)) {
        console.log('File stats:');
        console.log(fs.statSync(userPath));
        console.log('File content (first 5 lines):');
        console.log(fs.readFileSync(userPath, 'utf8').split('\n').slice(0, 5).join('\n'));
    }
} catch (err) {
    console.error('Error:', err.message);
}
