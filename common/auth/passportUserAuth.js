import cookie from 'cookie';
import passport, { Passport } from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import ENV from '../utils/env';
import prisma from '../../prisma';

// DB까지 확인하는 검증작업

const cookieExtractor = (socket) => {
  let token = null;

  if (socket) {
    const cookies = socket.headers.cookie;
    const parsedCookies = cookie.parse(cookies || ''); // 쿠키 파싱
    token = parsedCookies.accessToken; // accessToken 가져오기  console.log('cookies : ', cookies);
  }

  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: ENV.JWT_SECRET_KEY01,
};

const passportUserAuth = new Passport();

passportUserAuth.use(
  new Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        select: {
          id: true,
          email: true,
          nickname: true,
          loginType: true,
          roleType: true,
        },
        where: {
          id: jwt_payload.id,
        },
      });
      // console.log('passportUserAuth의 user 정보 : ', user);

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passportUserAuth;
