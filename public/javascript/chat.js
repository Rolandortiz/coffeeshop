const socket = io(`http://localhost:3000`);
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const adminRoom = 'adminroom';

function displayMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

socket.on('connect', () => {
  const isAdmin = true;

  socket.emit('join-room', { room: adminRoom, isAdmin });
  displayMessage('Hi, How can we help you?');
});

socket.on('chat-message', (data) => {
  displayMessage(data);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value;
  socket.emit('send-chat-message', { message, room: adminRoom });
  messageInput.value = '';
});
