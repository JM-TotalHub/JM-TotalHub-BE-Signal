import RedisManager from '../../../common/redis/redisManager';

const redisClient = RedisManager.getClient();

const joinChatRoom = async (chatRoomId, bodyData) => {
  console.log('요청 들어옴');

  const chatRoomKey = `chat-room:${chatRoomId}`;

  const chatRoomData = await redisClient.get(chatRoomKey);

  if (chatRoomData) {
    // 채팅룸 데이터가 존재하는 경우
  } else {
    // 채팅룸 데이터가 존재하지 않는 경우
  }
};

const ChatService = { joinChatRoom };

export default ChatService;
