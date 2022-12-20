const WebSocket = require('ws');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');

// Connect to the database
const db = new sqlite3.Database('chat.db');

// Create the table in the database if it doesn't already exist
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
	client_id INTEGER NOT NULL,
	message TEXT NOT NULL
  )
`);

// Serve static files from the public folder
app.use(express.static('public'));

// Set up a WebSocket server
const wss = new WebSocket.Server({ server: app.listen(33940) });

// Store connected clients in a Map object, where the keys are the client IDs and the values are the WebSocket objects
const clients = new Map();

// Set up a message queue
const messageQueue = [];
const QUEUE_SIZE_LIMIT = 100;

db.each('SELECT client_id, message FROM messages WHERE id > (SELECT MAX(id) FROM messages) - 100', function(err, row) {
  if(err) return console.log(err.message);
  messageQueue.push( row );
});

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
	addToQueueAndWriteToDb( { clientId, message } );
    messageQueue.push();

    // Broadcast the message to all connected clients
    for (const [id, client] of clients) {
      client.send(`[${clientId}] ${message}`);
    }
  });

  // When the client closes the connection
  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);

    // Remove the client from the map of connected clients
    clients.delete(clientId);
  });
});

function addToQueueAndWriteToDb(obj) {
  // Add the object to the queue
  messageQueue.push(obj);

  // If the queue exceeds the size limit, remove the oldest item
  if (messageQueue.length > QUEUE_SIZE_LIMIT) {
    messageQueue.shift();
  }

  // Write the object to the database
  db.serialize(() => {
    const stmt = db.prepare('INSERT INTO messages (client_id,message) VALUES (?,?)');
    stmt.run(obj.clientId,obj.message);
    stmt.finalize();
  });
  
}


console.log('Server listening on port 33940');