import ENV from '../utils/env';
import { createClient } from 'redis';

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

connectClient();

const RedisManager = {
  getClient: () => {
    if (!redisClient.isOpen) {
      throw new Error('Server client is not connected.');
    }
    return redisClient;
  },
};

export default RedisManager;
