// 전체 알림용 소캣핸들러
const notifySocketHandler = (socket) => {
  console.log('notifySocketHandler 적용');

  // 방 요청 - 방
  socket.on('joinNotificationRoom', () => {
    socket.join('notificationRoom');
    console.log(socket.id, ' : 방참여 요청 들어옴 ');
  });
};

export default notifySocketHandler;
