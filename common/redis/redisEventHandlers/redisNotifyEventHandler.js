import api from '../../connection/api';
import RedisPubSubManager from '../redisPubSubManager';

let isSubscribed = false;

const RedisNotifyEventHandler = async (io) => {
  const init = () => {
    isSubscribed = true;

    RedisPubSubManager.subscribeChannel(
      'join-notification-room',
      (jasonData) => {
        const data = JSON.parse(jasonData); // 메시지를 파싱합니다.
        console.log('RedisNotifyEventHandler 로 넘어오는 데이터 : ', data);

        userJoinNotificationRoom(data.socketId, data.userData, data.eventData);
      }
    );
  };

  const userJoinNotificationRoom = async (socketId, userData, eventData) => {
    // const socket = io.sockets.sockets.get(socketId);
    const socket = await socketCheck(socketId);
    // 알림방 참가
    socket.join('notification-room');
    // 알림방 참가 성공 알림
    socket.emit('notification-room-join-success');
    // 로그
    console.log(socket.id, ': notificationRoom 가입');
  };

  const socketCheck = async (socketId) => {
    // console.log(`알림 요청 소캣id : ${socketId}`);

    const socket = io.sockets.sockets.get(socketId);

    // console.log(`알림 요청 소캣 : ${socket.id}`);

    if (socket === null || !socket || !socket.connected) {
      console.log(`소캣 이전 것 걸렸다. : ${socketId}`);

      // socket.emit('error-auth', {
      //   err: 'TokenExpiredError',
      //   message: '토큰 만료됨',
      // });
      await api.post('/auth/new-token', {});

      return next(new Error('토큰 만료 - 큐 지나서'));
    } else {
      console.log('소캣 제대로 넘어옴 체크 완료');
      return socket;
    }
  };

  if (!isSubscribed) {
    init();
    console.log('RedisNotifyEventHandler 등록');
  }
};

export default RedisNotifyEventHandler;
