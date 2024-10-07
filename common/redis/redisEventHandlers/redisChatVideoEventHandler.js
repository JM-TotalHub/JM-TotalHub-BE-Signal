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
            userJoinChatRoomVideo(
              io,
              data.socketId,
              data.eventData.userId,
              data.eventData.chatRoomId
            );
            console.log('chat-room-video => type: join 요청 들어옴');
            break;
          case 'leave':
            console.log('chat-room-video => type: leave 요청 들어옴');
            userLeaveChatRoomVideo(
              io,
              data.socketId,
              data.eventData.userId,
              data.eventData.chatRoomId
            );
            break;
          case 'ice-candidate':
            console.log('chat-room-video => type: ice-candidate 요청 들어옴');
            webrtcIce(
              io,
              data.socketId,
              data.eventData.chatRoomId,
              data.eventData.userId,
              data.eventData.iceCandidate
            );
            break;
          case 'offer':
            console.log('chat-room-video => type: offer 요청 들어옴');
            webrtcOffer(
              io,
              data.socketId,
              data.eventData.chatRoomId,
              data.eventData.userId,
              data.eventData.offer
            );
            break;
          case 'answer':
            console.log('chat-room-video => type: answer 요청 들어옴');
            webrtcAnswer(
              io,
              data.socketId,
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

  const userJoinChatRoomVideo = async (io, socketId, userId, chatRoomId) => {
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

    console.log(`!!!!!!!!!!!!!!!!`);
    console.log(members);

    const arrayMembers = Object.values(members); // 배열

    console.log(`!!!!!!!!!!!!!!!!`);
    console.log(arrayMembers);

    const parsedMembers = arrayMembers.map((member) => JSON.parse(member)); // json

    console.log(`!!!!!!!!!!!!!!!!`);
    console.log(parsedMembers);

    // 방금 방을 들어온 사용자에게 현재 최신 화상채팅 참가인원 전달 (본인 포함 - 배열)
    socket.emit('chat-room-video', {
      type: 'members',
      members: parsedMembers,
    });

    // 기존의 화상채팅 참가자들에게 새로운 참가자 정보를 전달 (요청자 본인 내용만 - 유저 단일 객체)
    // const newMember = parsedMembers.filter((member) => member.id === userId); // 본인을 제외한 다른 참가자 정보 필터링
    const newMember = parsedMembers.find((member) => member.id === userId); // 본인 정보만 찾기

    console.log(`!!!!!!!!!!!!!!!!`);
    console.log(newMember);

    // 기존의 화상채팅 참가인원들에게 새로운 참가자가 들어왔다고 알림 (본인 내용만)
    socket.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'member-join',
      userId,
      newMember: newMember,
    });
  };

  const userLeaveChatRoomVideo = async (io, socketId, userId, chatRoomId) => {
    // 레디스에서 데이터 삭제
    const chatRoomVideoMembersKey = `chat-room:${chatRoomId}-video-members`;

    await redisClient.hDel(chatRoomVideoMembersKey, userId.toString());

    // const socket = await socketCheck(socketId);
    // const user = socket.user;

    // if (!socket) return;

    // 다른 화상채팅 인원들에게 요청자 방 나갔다고 알림
    io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'member-leave',
      userId,
    });
  };

  const webrtcIce = async (io, socketId, chatRoomId, userId, iceCandidate) => {
    console.log(
      `webrtcIce 핸들러 동작 == chatRoomId : ${chatRoomId} // iceCandidate : ${iceCandidate}`
    );

    const socket = await socketCheck(socketId);
    const user = socket.user;

    // io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
    //   type: 'ice-candidate',
    //   userId,
    //   ice: iceCandidate,
    // });

    socket.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'ice-candidate',
      userId,
      ice: iceCandidate,
    });
  };
  const webrtcOffer = async (io, socketId, chatRoomId, userId, offer) => {
    const socket = await socketCheck(socketId);
    const user = socket.user;

    // io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
    //   type: 'offer',
    //   userId,
    //   offer,
    // });
    socket.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
      type: 'offer',
      userId,
      offer,
    });
  };
  const webrtcAnswer = async (io, socketId, chatRoomId, userId, answer) => {
    console.log(
      `webrtcAnswer 핸들러 동작 == chatRoomId : ${chatRoomId} // userId : ${userId}`
    );
    console.log(chatRoomId);

    const socket = await socketCheck(socketId);
    const user = socket.user;

    // io.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
    //   type: 'answer',
    //   userId,
    //   answer,
    // });
    socket.to(`chat-room:${chatRoomId}`).emit('chat-room-video', {
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
