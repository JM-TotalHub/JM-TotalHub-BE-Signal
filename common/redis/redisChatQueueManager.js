import { createClient } from 'redis';
import ENV from '../utils/env';
import RedisPubSubManager from './redisPubSubManager';

const RedisChatQueueManager = (() => {
  const redisClient = createClient({
    url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
    password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
  });

  const connect = async () => {
    try {
      await redisClient.connect();
      console.log(`큐 레디스 연결`);
    } catch (err) {
      console.error(`큐 레디스 연결 실패:`, err);
    }
  };

  const addQueue = async (socket, event, eventData) => {
    try {
      const reply = await redisClient.rPush(
        'chatQueue', // 큐 이름
        JSON.stringify({
          socketId: socket.id,
          event,
          eventData,
        }) // 이벤트와 데이터를 함께 저장
      );
      // console.log('메시지 큐에 저장:', reply);
      return reply;
    } catch (err) {
      console.error('메시지 큐에 저장 시 에러발생:', err);
      throw err;
    }
  };

  const processQueue = async (io) => {
    if (!io) {
      console.log('IO 객체 안들어옴');
    }
    try {
      const item = await redisClient.lPop('chatQueue');
      if (item) {
        console.log('큐 새로운 작업 시작');
        const { socketId, event, eventData } = JSON.parse(item);
        console.log(
          `socketId: ${socketId}, event: ${event}, eventData: ${eventData}`
        );
        const socket = io.sockets.sockets.get(socketId);

        if (!socket) {
          // 현재 연결된 모든 소켓 ID 목록을 가져온다.
          const connectedSocketIds = Array.from(io.sockets.sockets.keys());
          console.log('현재 연결된 소켓 ID 목록:', connectedSocketIds);

          console.log(
            '올바른 소캣의 요청이 아닙니다. processQueue 동작 중 발생 \n' +
              `끊긴 이전 소캣연결일 확률이 있습니다. socketId: ${socketId}`
          );
          // return;
          await processQueue(io);
        }

        switch (event) {
          case 'saveMessages':
            await saveMessagesHandler(eventData);
            break;
          default:
            await generalEventHandler(socketId, event, eventData);
        }

        await processQueue(io);
      } else {
        // console.log('큐가 비어있습니다. 500ms 후에 다시 확인합니다...');
        setTimeout(() => processQueue(io), 500);
      }
    } catch (err) {
      console.error('큐 처리 중 오류:', err);
      setTimeout(() => processQueue(io), 500);
    }
  };

  const generalEventHandler = async (socketId, event, eventData) => {
    // data 객체 생성
    const JsonData = JSON.stringify({ socketId, eventData });

    // Redis Pub으로 메시지 발행
    await RedisPubSubManager.publishMessage(event, JsonData);
    // console.log('레디스 이벤트 핸들러에서 유저 데이터 확인01 : ', JsonData);
  };

  const saveMessagesHandler = async (data) => {
    // 처리 로직
    console.log('메시지 저장 처리:', data);
  };

  const startProcessing = async (io) => {
    console.log('큐 처리 시작...');
    await processQueue(io);
  };

  const initialize = async (io) => {
    await connect();
    await startProcessing(io);
  };

  return {
    initialize,
    addQueue,
  };
})();

export default RedisChatQueueManager;
