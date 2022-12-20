const WebSocket = require('ws');
const express = require('express');
const app = express();

// Serve static files from the public folder
app.use(express.static('public'));

// Set up a WebSocket server
const wss = new WebSocket.Server({ server: app.listen(33940) });

// Store connected clients in a Map object, where the keys are the client IDs and the values are the WebSocket objects
const clients = new Map();

// Set up a message queue
const messageQueue = [];

// Generate a unique ID for each client
let currentClientId = 0;

// When a client connects to the server
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Assign a unique ID to the client
  const clientId = currentClientId++;
  
  // Add the client to the map of connected clients
  clients.set(clientId, ws);
  
  messageQueue.forEach( message => clients.get(clientId).send(`[${message.clientId}] ${message.message}`));
  
  // When the client sends a message
  ws.on('message', (message) => {
    

    // Add the message to the queue
    messageQueue.push({ clientId, message });

    // Broadcast the message to all connected clients
    for (const [id, client] of clients) {
      client.send(`[${clientId}] ${message}`);
    }
  });

  // When the client closes the connection
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);

    // Remove the client from the map of connected clients
    clients.delete(escape(clientId));
  });
});

console.log('Server listening on port 33940');