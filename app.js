import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

console.log('환경 변수 확인:');
console.log('SIGNAL_SERVER_REDIS_URL:', process.env.SIGNAL_SERVER_REDIS_URL);
console.log('SIGNAL_SERVER_REDIS_PORT:', process.env.SIGNAL_SERVER_REDIS_PORT);
console.log(
  'SIGNAL_SERVER_REDIS_PASSWORD:',
  process.env.SIGNAL_SERVER_REDIS_PASSWORD
);

// import RedisSession from './common/redis/redisSession';
// import notifySocketHandler from './domains/notify/notify.socketHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${process.env.REACT_LOCAL_HOST}:${process.env.REACT_LOCAL_PORT}`,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 레디스 객체들 생성 & 모니터링 시작
// (async () => {
//   // await RedisManager.connect();
//   // await RedisPipeManger.connect();
//   await RedisSession.connect(io);
//   await RedisSession.startMonitor();
// })();

// 소캣 연결
// io.on('connect', async (socket) => {
//   console.log('소캣 연결 됨. socket id : ', socket.id);
//   notifySocketHandler(socket);

//   setInterval(() => {
//     const notificationMessage = '새로운 알림이 있습니다!';
//     io.to('notificationRoom').emit('newMessage', notificationMessage);
//     console.log('알림 전송');
//   }, 10000);
// });

// api
import chatRouter from './domains/chat/routers';
app.use('chat', chatRouter);

const PORT = 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
