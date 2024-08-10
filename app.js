import ENV from './common/utils/env';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import morgan from 'morgan';
import cors from 'cors';

import RedisSession from './common/redis/redisSession';
import ChatSocketHandler from './domains/chat/socketHandlers/chat.socketHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // origin: `${ENV.REACT_LOCAL_HOST}:${ENV.REACT_LOCAL_PORT}`,
    origin: 'http://10.1.10.191',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(morgan('dev'));

// CORS 설정
// app.use(
//   cors({
//     origin: `http://localhost:5000`, // 허용할 출처
//     methods: ['GET', 'POST'], // 허용할 HTTP 메서드
//     credentials: true, // 쿠키 및 인증 정보를 포함한 요청을 허용
//   })
// );

(async () => {
  await RedisSession.connect(io);
  await RedisSession.startMonitor();
})();

io.on('connect', async (socket) => {
  console.log('소캣 연결 됨. socket id : ', socket.id);
  ChatSocketHandler(socket);

  setInterval(() => {
    const notificationMessage = '연결 확인 중';
    io.to('notificationRoom').emit('newMessage', notificationMessage);
    console.log('연결 확인 : ', socket.id);
  }, 100000);
});

// api
import chatRouter from './domains/chat/routers';
app.use('/chats', chatRouter);

const PORT = 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
