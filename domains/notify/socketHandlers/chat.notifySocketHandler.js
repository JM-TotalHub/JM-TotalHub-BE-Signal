const notifySocketHandler = (socket) => {
  const userJoinNotificationRoom = (data) => {
    socket.join('notification-room');
    socket.emit('notification-room-join-success');
    console.log(socket.id, ': notificationRoom 가입');
  };

  const init = () => {
    socket.on('join-notification-room', userJoinNotificationRoom);
  };

  init();
};

export default notifySocketHandler;
