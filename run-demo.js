// Simple demo runner to bypass npm issues
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Expense Manager OCR Demo...');
console.log('');

// Start backend
console.log('📦 Starting backend server...');
const backend = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit then start frontend
setTimeout(() => {
  console.log('📦 Starting frontend server...');
  const frontend = spawn('npx', ['vite'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

console.log('');
console.log('📧 Demo Accounts:');
console.log('   Admin:    admin@demo.com    / admin123');
console.log('   Manager:  manager@demo.com  / manager123');
console.log('   Employee: employee@demo.com / employee123');
console.log('');
console.log('🌐 URLs:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend:  http://localhost:5000');
console.log('');
console.log('Press Ctrl+C to stop both servers');