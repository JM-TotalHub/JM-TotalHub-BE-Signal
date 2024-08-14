import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ENV from './common/utils/env';

import cookie from 'cookie';

import morgan from 'morgan';

import RedisSession from './common/redis/redisSession';

import notifySocketHandler from './domains/notify/socketHandlers/chat.notifySocketHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: `${ENV.REACT_LOCAL_HOST}:${ENV.REACT_LOCAL_PORT}`,
    // origin: 'http://15.165.250.99',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

// 요청 내용 로그
app.use((req, res, next) => {
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  next();
});

(async () => {
  await RedisSession.connect(io);
  await RedisSession.startMonitor();
})();

// 소캣 연결 시
io.on('connect', async (socket) => {
  console.log('소캣 연결 됨. socket id : ', socket.id);
  console.log('연결 요청 객체 : ', socket.request);

  const cookies = socket.handshake.headers.cookie;
  const parsedCookies = cookie.parse(cookies || ''); // 쿠키 파싱
  const token = parsedCookies.accessToken; // accessToken 가져오기  console.log('cookies : ', cookies);
  console.log('accessToken:', token);

  // 전체 알림 방 이벤트 핸들러
  notifySocketHandler(socket);

  // 연결 확인 메시지 전송 (테스트용)
  const intervalId = setInterval(() => {
    const notificationMessageToAll = `소켓 연결 메시지 from ${socket.id}`;
    io.to('notification-room').emit(
      'notification-to-all',
      notificationMessageToAll
    );
    console.log('연결 확인 : ', socket.id);
  }, 5000);

  // 연결 끊길 시
  socket.on('disconnect', () => {
    clearInterval(intervalId);
    console.log('연결 끊음 : ', socket.id);
  });
});

// 소캣 에러 로그
io.engine.on('connection_error', (err) => {
  console.log(err.req);
  console.log(err.code);
  console.log(err.message);
  console.log(err.context);
});

// api
import chatRouter from './domains/chat/routers';
import cookieParser from 'cookie-parser';
app.use('/chats', chatRouter);

// 연결 테스트용 API 엔드포인트
app.get('/api/test', (req, res) => {
  res.status(200).send({ message: 'API 연결 확인 완료' });
});

const PORT = 7000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
