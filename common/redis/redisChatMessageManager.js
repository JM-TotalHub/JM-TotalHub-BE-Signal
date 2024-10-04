import { createClient } from 'redis';
import ENV from '../utils/env';
import api from '../connection/api';

const redisClient = createClient({
  url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
  password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
});

const connectClient = async () => {
  try {
    await redisClient.connect();
    console.log(`Signal Redis Connected`);
  } catch (err) {
    console.error(`Error connecting to RedisClient:`, err);
  }
};

// 모든 활성화된 채팅방의 메시지를 가져오는 함수
const fetchAllChatRoomsMessages = async () => {
  // 모든 채팅방 메시지 키 목록을 가져옵니다.
  const chatRoomMessageKeys = await redisClient.keys('chat-room:*-messages');
  const chatRoomsMessages = {};

  for (const key of chatRoomMessageKeys) {
    const chatRoomId = key.split(':')[1]; // 채팅방 ID 추출 (예: "1" 추출)
    const messages = await redisClient.lRange(key, 1, -1); // 0부터 -1까지 모든 메시지 가져오기
    chatRoomsMessages[chatRoomId] = messages.map((message) =>
      JSON.parse(message)
    );
  }

  return chatRoomsMessages;
};

// 메시지를 API에 묶어서 저장하는 함수
const saveMessages = async () => {
  try {
    const chatRoomsMessages = await fetchAllChatRoomsMessages();

    for (const [chatRoomId, messages] of Object.entries(chatRoomsMessages)) {
      if (messages.length > 0) {
        await api.post('/messages', { chatRoomId, messages });
        console.log(`Saved messages for chat room: ${chatRoomId}`);

        // 성공적으로 저장한 메시지는 Redis에서 삭제
        await redisClient.del(`chat-room:${chatRoomId}-messages`);
      }
    }
  } catch (error) {
    console.error('Error saving messages to API:', error);
  }
};

// 주기적으로 API에 메시지를 저장하는 함수
const startSavingMessages = (interval) => {
  setInterval(saveMessages, interval);
};

// 연결 및 주기적 메시지 저장 시작
const init = async () => {
  await connectClient();
  startSavingMessages(5000); // 5초마다 메시지 저장
};

const redisChatMessageManager = {
  startSavingMessages,
  init,
};

export default redisChatMessageManager;
