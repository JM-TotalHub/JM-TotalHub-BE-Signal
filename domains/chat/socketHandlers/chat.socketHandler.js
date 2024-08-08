// ChatSocketHandler.js
class ChatSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.init();
  }

  init() {
    this.socket.join('notificationRoom');
    this.socket.on('joinRoom', this.userJoinedRoom.bind(this));
    this.socket.on('sendMessage', this.handleMessage.bind(this));
  }

  userJoinedRoom(username) {
    console.log(`${username} has joined the chat.`);
    this.socket.broadcast.emit(
      'userJoined',
      `${username} has joined the chat.`
    );
  }

  handleMessage(message) {
    console.log(`Received message: ${message}`);
    this.socket.broadcast.emit('newMessage', message);
  }
}

export default ChatSocketHandler;
