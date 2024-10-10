import api from '../connection/api';
import RedisManager from './redisManager';

const redisClient = RedisManager.getClient();

const RedisChatMessageManager = (() => {
  // 모든 활성화된 채팅방의 메시지를 가져오는 함수
  const fetchAllChatRoomsMessages = async () => {
    // 모든 채팅방 메시지 키 목록을 가져옵니다.
    const chatRoomMessageKeys = await redisClient.keys('chat-room:*-messages');
    const chatRoomsMessages = {};

    for (const key of chatRoomMessageKeys) {
      // const chatRoomId = key.split(':')[1]; // 채팅방 ID 추출 (예: "1" 추출)
      // console.log('key : ', key);
      // console.log('chatRoomId : ', chatRoomId);

      const match = key.match(/chat-room:(\d+)-messages/);
      const chatRoomId = match ? match[1] : null;
      console.log('chatRoomId : ', chatRoomId);

      const messages = await redisClient.lRange(key, 0, -1); // 1부터 -1까지 모든 메시지 가져오기
      chatRoomsMessages[chatRoomId] = messages.map((message) =>
        JSON.parse(message)
      );
    }
    // 채팅방 ID를 키값으로 배열에 메시지 객체들 삽입
    return chatRoomsMessages;
  };

  // 메시지를 API에 묶어서 저장하는 함수
  const saveMessages = async () => {
    try {
      const chatRoomsMessages = await fetchAllChatRoomsMessages();

      for (const [chatRoomId, messages] of Object.entries(chatRoomsMessages)) {
        if (messages.length > 0) {
          await api.post('/chats/chat-rooms/messages', {
            chatRoomId,
            messages,
          });
          console.log(`Saved messages for chat room: ${chatRoomId}`);

          // 성공적으로 저장한 메시지는 Redis에서 삭제
          await redisClient.del(`chat-room:${chatRoomId}-messages`);
        }
      }
    } catch (error) {
      console.error('Error saving messages to API1:', error.errorMessage);
    }
    console.log('메시지 저장 로직 동작완료');
  };

  const saveMessagesByChatRoomId = async (chatRoomId) => {
    const key = `chat-room:${chatRoomId}-messages`;
    const rawMessages = await redisClient.lRange(key, 0, -1);

    const messages = rawMessages.map((message) => JSON.parse(message));

    console.log(
      'saveMessagesByChatRoomId 로직 중 key: ',
      key,
      'rawMessages : ',
      rawMessages,
      'messages : ',
      messages
    );

    try {
      if (messages.length > 0) {
        await api.post('/chats/chat-rooms/messages', {
          chatRoomId,
          messages,
        });
      }
      await redisClient.del(`chat-room:${chatRoomId}-messages`);
    } catch (error) {
      console.error('Error saving messages to API2:', error.errorMessage);
    }
  };
  return { saveMessages, saveMessagesByChatRoomId };
})();

export default RedisChatMessageManager;
