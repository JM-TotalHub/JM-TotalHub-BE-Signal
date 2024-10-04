import cookie from 'cookie';
import passportUserAuth from './passportUserAuth';
import passportTokenAuth from './passportTokenAuth';
import RedisManager from '../redis/redisManager';
import ENV from '../utils/env';
import getExpirationInSeconds from '../utils/expireTime';

const redisClient = RedisManager.getClient();

// 소캣 첫 연결 인증 작업
const jwtAuthMiddleware = async (socket, event, eventData, next) => {
  console.log('<<jwt 미들웨어 동작>>');

  const cookies = socket.handshake.headers.cookie;
  const parsedCookies = cookie.parse(cookies || '');
  const token = parsedCookies.accessToken;

  console.log('jwt 미들웨어 토큰 : ', token);
  console.log('jwt 미들웨어 유저 : ', socket.user);

  console.log('소캣 구조1 : ', event);
  console.log('소캣 구조2 : ', eventData);

  // 1. 비회원 소캣 접근 : 토큰 없음 (비계정 사용자 OR 로그인 전 사용자)
  if (!token) {
    console.log('토큰 없음 - 비회원 소캣 요청');
    return next();
  }

  // 2. 회원의 소캣 접근
  // if (token) {
  // 2-1. 인증 안 된 소캣 요청 (토큰있음 소캣 사용자 정보 없음 => 첫 소캣 연결)
  if (!socket.user) {
    console.log('토큰 있음 & 소캣 유저정보 없음!!!');
    // 사용자 인증
    passportUserAuth.authenticate(
      'jwt',
      { session: false },
      async (err, user, info) => {
        // 복합 에러
        if (err) {
          console.log('jwt 미들웨어 인증 실패: ', err);
          socket.emit('error-auth', {
            err: err,
            message: '인증 실패',
            originalEvent: event,
            originalData: eventData,
          });
          return next(new Error('토큰에 이상발생'));
        }
        // 토큰 관련 에러
        if (info && info.name === 'TokenExpiredError') {
          console.log('jwt 미들웨어 토큰 만료됨1');
          socket.emit('error-auth', {
            err: info.name,
            message: '토큰 만료됨',
            originalEvent: event,
            originalData: eventData,
          });
          return next(new Error('토큰 만료1'));
        } else {
          console.log('jwt 토큰이상없음1: ', info);
        }
        if (user) {
          console.log('jwt 미들웨어 사용자 정보 얻음');
          socket.user = user;

          await redisClient.set(
            `socket:${user.id}`,
            socket.id,
            'EX',
            getExpirationInSeconds(ENV.JWT_REFRESH_TOKEN_EXPIRATION)
          );

          return next();
        } else {
          console.log('jwt 미들웨어 사용자 정보 얻지 못함');
        }
      }
    )(socket.request, {}, next);
  } else {
    // 2-2. 인증된 소캣 요청 (토큰 & 소캣 사용자 정보 다 있음)
    console.log('토큰 있음 & 소캣 유저정보 있음!!!');
    passportTokenAuth.authenticate(
      'jwt',
      { session: false },
      async (err, user, info) => {
        // 복합 에러
        if (err) {
          console.log('jwt 미들웨어 인증 실패2: ', err);
          socket.emit('error-auth', {
            err: info.name,
            message: '토큰 만료됨',
            originalEvent: event,
            originalData: eventData,
          });
          return next(new Error('토큰에 이상발생2'));
        }
        // 토큰 관련 에러
        if (info && info.name === 'TokenExpiredError') {
          console.log('jwt 미들웨어 토큰 만료됨2');
          socket.emit('error-auth', {
            err: info.name,
            message: '토큰 만료됨',
            originalEvent: event,
            originalData: eventData,
          });
          return next(new Error('토큰 만료'));
        } else {
          console.log('jwt 토큰이상없음2: ', info);
        }
        if (user) {
          console.log('jwt 미들웨어 사용자 정보 얻음2 : ', user);
          // socket.user = user; // 유저정보는 첫 연결했던걸로 유지
          console.log(
            'passportTokenAuth로 들어가 유저 정보 socket.user : ',
            socket.user
          );
          await redisClient.set(
            `socket:${user.id}`,
            socket.id,
            'EX',
            getExpirationInSeconds(ENV.JWT_REFRESH_TOKEN_EXPIRATION)
          );
          return next();
        } else {
          console.log('jwt 미들웨어 사용자 정보 얻지 못함2');
        }
      }
    )(socket.request, {}, next);
  }
};
// };

export default jwtAuthMiddleware;
