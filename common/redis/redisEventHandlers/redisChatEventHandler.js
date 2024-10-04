import RedisManager from '../redisManager';
import RedisPubSubManager from '../redisPubSubManager';

let isSubscribed = false;

const redisClient = RedisManager.getClient();

const RedisChatEventHandler = async (io) => {
  const init = () => {
    isSubscribed = true;

    // TODO: 여기 사용자 인증 상태에 따른 반환값 설정
    RedisPubSubManager.subscribeChannel('join-chat-room', (jasonData) => {
      const data = JSON.parse(jasonData);
      try {
        userJoinRoom(data.socketId, data.eventData.chatRoomId);
      } catch (error) {
        console.error(
          `RedisChatEventHandler - userJoinRoom 에러 발생 : ${error.message}`
        );
      }
    });

    RedisPubSubManager.subscribeChannel('leave-chat-room', (jasonData) => {
      const data = JSON.parse(jasonData);
      userLeftRoom(data.socketId, data.eventData.chatRoomId);
    });

    RedisPubSubManager.subscribeChannel(
      'chat-room-message-send',
      (jasonData) => {
        console.log(`채팅 메시지 이벤트 처리중`);
        const data = JSON.parse(jasonData);
        handleMessage(
          data.socketId,
          data.eventData.chatRoomId,
          data.eventData.message
        );
      }
    );
  };

  const userJoinRoom = (socketId, chatRoomId) => {
    const socket = io.sockets.sockets.get(socketId);
    const user = socket.user;

    console.log(`${user.email}가 채팅방 ${chatRoomId} 방들어옴.`);
    console.log(`소캣ID : ${socketId} & 사용자 정보: ${user.email}`);

    // 채팅방 참가
    socket.join(`chat-room:${chatRoomId}`);
    // 채팅방 참가 알림
    socket.broadcast.to(`chat-room:${chatRoomId}`).emit('chat-room-user-join', {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      loginType: user.loginType,
      roleType: user.roleType,
    });
    // 테스트용 참가 알림
    io.to(`chat-room:${chatRoomId}`).emit(
      'chat-room-join-success',
      `채팅방 참가 완료 : ${user.email}`
    );
  };

  const userLeftRoom = async (socketId, chatRoomId) => {
    const socket = io.sockets.sockets.get(socketId);
    const user = socket.user;

    console.log(`${user.email}가 채팅방 ${chatRoomId} 방나감.`);

    // 레디스 채팅방 참가자 목록에서 제거
    await redisClient.hDel(`chat-room:${chatRoomId}-members`, String(user.id));

    // 채팅방에 퇴장 알림
    io.to(`chat-room:${chatRoomId}`).emit('chat-room-user-leave', {
      userId: user.id,
    });

    // 레디스에서 참가자 목록 가져오기
    const remainingMembers = await redisClient.hGetAll(
      `chat-room:${chatRoomId}-members`
    );

    console.log('남은 채팅방 참가자 목록:', remainingMembers); // 참가자 목록 로그

    // 채팅방에 멤버가 하나도 없으면 관련 데이터 삭제
    if (Object.keys(remainingMembers).length === 0) {
      await redisClient.del(`chat-room:${chatRoomId}-info`);
      await redisClient.del(`chat-room:${chatRoomId}-members`);
      await redisClient.del(`chat-room:${chatRoomId}-messages`);
      console.log(
        `참가자가 없어 ${chatRoomId} 채팅방의 모든 데이터가 비활성화(삭제)되었습니다.`
      );
    }

    // 방을 나감
    socket.leave(`chat-room:${chatRoomId}`);
  };

  const handleMessage = async (socketId, chatRoomId, message) => {
    const socket = io.sockets.sockets.get(socketId);
    const user = socket.user;

    console.log(
      `채팅방 메시지 전송: ${chatRoomId}채팅방에서 ${user.email}가 ${message} 메시지를 보냄`
    );

    await redisClient.rPush(
      `chat-room:${chatRoomId}-messages`,
      JSON.stringify({
        userId: user.id,
        userEmail: user.email,
        message: message,
        createdAt: new Date().toISOString(),
      })
    );

    io.to(`chat-room:${chatRoomId}`).emit('chat-room-new-message', {
      userId: user.id,
      userEmail: user.email,
      message: message,
    });
  };

  if (!isSubscribed) {
    init();
    console.log('RedisChatEventHandler 등록됨');
  }
};

export default RedisChatEventHandler;
