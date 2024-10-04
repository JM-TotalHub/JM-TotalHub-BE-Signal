import { createClient } from 'redis';
import ENV from '../utils/env';

const RedisPubSubManager = (() => {
  const pub = createClient({
    url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
    password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
  });

  const sub = pub.duplicate();

  const connect = async () => {
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

  const publishMessage = async (channel, message) => {
    const publisher = getPublisher();
    await publisher.publish(channel, message);
  };

  const subscribeChannel = async (channel, callback) => {
    const subscriber = getSubscriber();
    await subscriber.subscribe(channel, (message) => {
      callback(message);
    });
  };

  return {
    connect,
    getPublisher,
    getSubscriber,
    publishMessage,
    subscribeChannel,
  };
})();

export default RedisPubSubManager;
