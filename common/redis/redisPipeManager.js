import { createClient } from 'redis';
import ENV from '../utils/env';

const RedisPipeManager = (() => {
  let pub = null;
  let sub = null;

  const connect = async () => {
    pub = createClient({
      url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
      password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
      legacyMode: false,
    });

    sub = pub.duplicate();

    try {
      await pub.connect();
      console.log('Publisher connected to Redis');

      await sub.connect();
      console.log('Subscriber connected to Redis');
    } catch (err) {
      console.error('Error connecting to Redis:', err);
    }
  };

  const getPublisher = () => {
    if (!pub || !pub.isOpen) {
      throw new Error('Publisher client is not connected.');
    }
    return pub;
  };

  const getSubscriber = () => {
    if (!sub || !sub.isOpen) {
      throw new Error('Subscriber client is not connected.');
    }
    return sub;
  };

  return {
    connect,
    getPublisher,
    getSubscriber,
  };
})();

export default RedisPipeManager;
