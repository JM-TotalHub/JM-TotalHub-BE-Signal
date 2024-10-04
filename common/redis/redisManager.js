import ENV from '../utils/env';
import { createClient } from 'redis';

const RedisManager = (() => {
  // 레디스 연결객체
  let redisClient;
  // 레디스 초기화 상태
  let isInitialized = false;

  const initializeClient = async () => {
    if (!isInitialized) {
      try {
        redisClient = createClient({
          url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
          password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
        });
        await redisClient.connect();
        console.log('Redis connected');
        isInitialized = true;
      } catch (error) {
        throw error;
      }
    }
  };

  const getClient = () => {
    if (!redisClient) {
      console.log('레디스 매니저 객체 없음');
      initializeClient();
    }
    console.log('레디스 매니저 객체 있음');
    return redisClient;
  };

  return { getClient };
})();

export default RedisManager;
