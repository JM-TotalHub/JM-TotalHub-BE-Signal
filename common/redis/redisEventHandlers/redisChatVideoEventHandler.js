import chatVideoTemplate from '../../../domains/chat/utils/chatVideoTemplate';
import RedisManager from '../redisManager';
import RedisPubSubManager from '../redisPubSubManager';

let isSubscribed = false;

const redisClient = RedisManager.getClient();

const RedisChatVideoEventHandler = async (io) => {
  const init = () => {
    isSubscribed = true;

    RedisPubSubManager.subscribeChannel('chat-room-video', (jasonData) => {
      try {
        const data = JSON.parse(jasonData);

        switch (data.eventData.type) {
          case 'join':
            userJoinChatRoomVideo(data.socketId, data.eventData.chatRoomId);
            console.log('chat-room-video => type: join 요청 들어옴');
            break;
          case 'leave':
            console.log('chat-room-video => type: leave 요청 들어옴');
            break;
          case 'ice-candidate':
            console.log('chat-room-video => type: ice-candidate 요청 들어옴');
            webrtcIce(
              data.eventData.chatRoomId,
              data.eventData.userId,
              data.eventData.iceCandidate
            );
            break;
          case 'offer':
            console.log('chat-room-video => type: offer 요청 들어옴');
            webrtcOffer(
              data.eventData.chatRoomId,
              data.eventData.userId,
              data.eventData.offer
            );
            break;
          case 'answer':
            console.log('chat-room-video => type: answer 요청 들어옴');
            webrtcAnswer(
              data.eventData.chatRoomId,
              data.eventData.userId,
              data.eventData.answer
            );
            break;
        }
      } catch (error) {
        console.error('RedisChatVideoEventHandler 에러 발생:', err.message);
      }
    });
  };

  const userJoinChatRoomVideo = async (socketId, chatRoomId) => {
    const socket = await socketCheck(socketId);
    const user = socket.user;

    const chatRoomVideoMembersKey = `chat-room:${chatRoomId}-video-members`;

    console.log(`${user.email}가 화상채팅방 ${chatRoomId} 방들어옴.`);
    console.log(`소캣ID : ${socketId} & 사용자 정보: ${user.email}`);

    // 유저(채팅 참가자) 데이터 템플릿화
    const userTemplate = chatVideoTemplate.createUserTemplate(user, socketId);

    await redisClient.hSet(
      chatRoomVideoMembersKey,
      user.id.toString(),
      JSON.stringify(userTemplate)
    );

    const members = await redisClient.hGetAll(chatRoomVideoMembersKey);
    const parsedMembers = Object.keys(members).reduce((acc, key) => {
      acc[key] = JSON.parse(members[key]);
      return acc;
    }, {});

    socket.emit('chat-room-video', {
      type: 'members',
      newMember: parsedMembers,
    });
  };

  const webrtcIce = async (chatRoomId, userId, iceCandidate) => {
    console.log(
      `webrtcIce 핸들러 동작 == chatRoomId : ${chatRoomId} // iceCandidate : ${iceCandidate}`
    );

    io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'ice-candidate',
      userId,
      ice: iceCandidate,
    });
  };
  const webrtcOffer = async (chatRoomId, userId, offer) => {
    io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'offer',
      userId,
      offer,
    });
  };
  const webrtcAnswer = async (chatRoomId, userId, answer) => {
    console.log(
      `webrtcAnswer 핸들러 동작 == chatRoomId : ${chatRoomId} // userId : ${userId}`
    );
    console.log(chatRoomId);

    io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'answer',
      userId,
      answer,
    });
  };

  const socketCheck = async (socketId) => {
    console.log(`화상채팅 요청 소캣id : ${socketId}`);

    const socket = io.sockets.sockets.get(socketId);

    console.log(`화상채팅 요청 소캣 : ${socket.id}`);

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
    console.log('RedisChatVideoEventHandler 등록됨');
  }
};

export default RedisChatVideoEventHandler;
