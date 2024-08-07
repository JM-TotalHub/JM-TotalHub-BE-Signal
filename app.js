import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import RedisManger from './common/redis/redisManager';
import RedisSession from './common/redis/redisSession';
import notifySocketHandler from './domains/notify/notify.socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${process.env.REACT_LOCAL_HOST}:${process.env.REACT_LOCAL_PORT}`, // http://localhost:3000
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// app.use(
//   cors({
//     origin: `${process.env.REACT_LOCAL_HOST}:${process.env.REACT_LOCAL_PORT}`,
//     credentials: true,
//   })
// );

// 레디스  sub, pub 기능 오류 최소화를 위해서 redis 객체를 sub, pub 별로 따로 운영할 레디스 객체 생성
const redisPubManager = new RedisManger();
const redisSubManager = new RedisManger();

// RedisAdapter 적용 및 레디스 인메모리 사용을 위한 레디스 객체 생성
const redisSession = new RedisSession();

(async () => {
  const redisClient = await redisSession.init(io);
  redisSession.startMonitor(redisClient);
})();

// 나중에 소캣 연결 끊어진 것에 대한 처리
// redisSubManager.구독(disconnect)

io.on('connect', async (socket) => {
  console.log(socket.id + ': 연결 됨');
  notifySocketHandler(socket);

  setInterval(() => {
    const notificationMessage = '새로운 알림이 있습니다!';
    io.to('notificationRoom').emit('newMessage', notificationMessage);
    console.log('알림 전송');
  }, 5000); // 1초마다 메시지 전송
});

const PORT = 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
