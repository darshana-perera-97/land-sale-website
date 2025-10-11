#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Chatbot Backend Server...\n');

// Start the backend server
const backend = spawn('node', ['backend/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`\n🛑 Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down chatbot server...');
  backend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down chatbot server...');
  backend.kill('SIGTERM');
});

console.log('✅ Chatbot backend server is starting...');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('🤖 Chatbot API available at: http://localhost:3000/api/chatbot');
console.log('\nPress Ctrl+C to stop the server\n');
