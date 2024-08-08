import ENV from '../utils/env';
import { createClient } from 'redis';

// Redis 클라이언트 인스턴스 생성
const redisClient = createClient({
  url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
  password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
});

// Redis 클라이언트 연결
const connectClient = async () => {
  try {
    await redisClient.connect();
    console.log(`Redis Connected`);
  } catch (err) {
    console.error(`Error connecting to RedisClient:`, err);
  }
};

// 클라이언트 연결 수행
connectClient();

// RedisManager 객체
const RedisManager = {
  getClient: () => {
    if (!redisClient.isOpen) {
      throw new Error('Server client is not connected.');
    }
    return redisClient; // 단일 인스턴스 반환
  },
};

export default RedisManager;
