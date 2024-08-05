class ChatSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.init();
  }

  init() {
    this.socket.on('joinRoom', this.userJoinedRoom.bind(this));
  }

  userJoinedRoom(username) {
    console.log(`${username} has joined the chat.`);
    // 모든 클라이언트에게 사용자 참여 알림
    this.socket.broadcast.emit(
      'userJoined',
      `${username} has joined the chat.`
    );
  }
}
