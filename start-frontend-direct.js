const { spawn } = require('child_process');
const path = require('path');

console.log('🎨 Starting Expense Tracker Frontend...');

// Start Vite directly with clean environment
const vite = spawn('"C:\\Program Files\\nodejs\\npx.cmd"', ['vite', '--host', '0.0.0.0'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PATH: 'C:\\Program Files\\nodejs;C:\\Windows\\System32'
  }
});

vite.on('error', (err) => {
  console.error('❌ Frontend failed:', err.message);
});

console.log('🌐 Frontend starting at: http://localhost:5173');
console.log('📧 Login: employee@demo.com / employee123');