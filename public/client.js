const ws = new WebSocket('wss://chat.[domain]');
const form = document.getElementById('form');
const messagesDiv = document.getElementById('messages');
const inputBox = document.getElementById('message');

ws.onopen = function(e) {
	console.log('Connected to server');
};



ws.onclose = function(event) {
	console.log('Disconnected from server');
};

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const clientName = document.getElementById('clientName').value;
	const message = document.getElementById('message').value;

	ws.send(`[${clientName}] ${message}`);
	inputBox.value = "";
	});
	
ws.onmessage = function(message) {
	console.log(`Received message from server: ${message.data}`);
	messagesDiv.innerHTML += `<p>${message.data}</p>`;
	messagesDiv.scrollTop = messagesDiv.scrollHeight;

};
