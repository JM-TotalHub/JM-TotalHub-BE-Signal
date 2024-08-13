// ChatSocketHandler.js
const notifySocketHandler = (socket) => {
  const init = () => {
    socket.join('notificationRoom');
    console.log(socket.id, ' notificationRoom 가입');
    socket.on('joinRoom', userJoinedRoom);
    socket.on('sendMessage', handleMessage);
  };

  const userJoinedRoom = (username) => {
    console.log(`${username} has joined the chat.`);
    socket.broadcast.emit('userJoined', `${username} has joined the chat.`);
  };

  const handleMessage = (message) => {
    console.log(`Received message: ${message}`);
    socket.broadcast.emit('newMessage', message);
  };

  init();
};

export default notifySocketHandler;
