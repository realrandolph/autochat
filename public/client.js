const ws = new WebSocket('wss://chat.[domain]');
const form = document.getElementById('form');
const messagesDiv = document.getElementById('messages');

ws.onopen = function(e) {
	console.log('Connected to server');
};



ws.onclose = function(event) {
	console.log('Disconnected from server');
};

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const clientId = document.getElementById('clientId').value;
	const message = document.getElementById('message').value;

	ws.send(`[${clientId}] ${message}`);
	});
	
ws.onmessage = function(message) {
	console.log(`Received message from server: ${message.data}`);
	messagesDiv.innerHTML += `<p>${message.data}</p>`;
	messagesDiv.scrollTop = messagesDiv.scrollHeight;
};
