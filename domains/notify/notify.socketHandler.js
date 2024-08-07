// notifySocketHandler.js
const notifySocketHandler = (socket) => {
  console.log('notifySocketHandler 적용');

  socket.on('joinNotificationRoom', () => {
    socket.join('notificationRoom');
    console.log(socket.id, ' : 방참여 요청 들어옴 ');
  });
};

export default notifySocketHandler;
