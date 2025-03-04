const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store all connected users and their cursor positions
const cursorPositions = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Initialize the user's cursor position
  cursorPositions[socket.id] = { x: 0, y: 0 };
  
  // When the user moves their cursor
  socket.on('cursor-move', (position) => {
    cursorPositions[socket.id] = position;
    
    // Broadcast all cursor positions to all clients
    io.emit('cursor-positions', cursorPositions);
  });
  
  // When the user disconnects
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove the user's cursor position
    delete cursorPositions[socket.id];
    
    // Notify all clients that a user has disconnected
    io.emit('user-disconnected', socket.id);
    io.emit('cursor-positions', cursorPositions);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
