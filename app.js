import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ENV from './common/utils/env';

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import jwtAuthMiddleware from './common/auth/jwtAuthMiddleware';

import RedisChatQueueManager from './common/redis/redisChatQueueManager';
import RedisPubSubManager from './common/redis/redisPubSubManager';
import RedisSessionManager from './common/redis/redisSessionManager';

import RedisChatEventHandler from './common/redis/redisEventHandlers/redisChatEventHandler';
import RedisNotifyEventHandler from './common/redis/redisEventHandlers/redisNotifyEventHandler';

console.log('여기 지나감');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.CORS_REACT_SERVER_BASE_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 미들웨어
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// 전역 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 동작 시동걸기
(async () => {
  // 레디스 adapter 연결
  await RedisSessionManager.connect(io);
  // 레디스 상태 모니터링
  await RedisSessionManager.startMonitor();
  // 레디스 pub, sub 객체 초기화
  await RedisPubSubManager.connect();
  // 레디스 큐 객체 초기화
  await RedisChatQueueManager.initialize(io);

  // 레디스 주요 채널 구독
  await RedisPubSubManager.subscribeChannel('generalEvent', (message) => {
    const { event, data } = JSON.parse(message);
    console.log(`레디스 이벤트 수신: ${event}, data:`, data);
  });

  // 레디스 pub/sub 이벤트 핸들러 등록
  await RedisNotifyEventHandler(io);
  await RedisChatEventHandler(io);
  await RedisChatVideoEventHandler(io);
})();

// 소캣 연결
io.on('connect', async (socket) => {
  socket.onAny((event, eventData) => {
    console.log('소캣 요청들어옴 : ', event);

    jwtAuthMiddleware(socket, event, eventData, (err) => {
      if (err) {
        console.log('jwt 미들웨어 처리 시 문제 발생: ', err);
      } else {
        RedisChatQueueManager.addQueue(socket, event, eventData);
      }
    });
  });

  // 연결 확인 메시지 전송 (테스트용)
  console.log('소캣 연결 됨. socket id : ', socket.id);
  const intervalId = setInterval(() => {
    console.log('소캣 연결 중 : ', socket.id);
    const notificationMessageToAll = `소켓 연결 메시지 from ${socket.id}`;
    socket.emit('notification-to-all', notificationMessageToAll);
  }, 10000);

  // 연결 끊길 시
  socket.on('disconnect', () => {
    clearInterval(intervalId);
    console.log('연결 끊음 : ', socket.id);
  });
});

io.engine.on('connection_error', (err) => {
  console.log(err.req);
  console.log(err.code);
  console.log(err.message);
  console.log(err.context);
});

// http api
import chatRouter from './domains/chat/routers';
import RedisChatVideoEventHandler from './common/redis/redisEventHandlers/redisChatVideoEventHandler';
app.use('/chats', chatRouter);

// 연결 테스트용 API 엔드포인트
app.get('/api/test', (req, res) => {
  res.status(200).send({ message: 'API 연결 확인 완료' });
});

// 서버 실행
const PORT = 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
