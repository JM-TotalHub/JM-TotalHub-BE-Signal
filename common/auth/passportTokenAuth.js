import cookie from 'cookie';
import passport, { Passport } from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import ENV from '../utils/env';

// 토큰만 확인하는 검증작업

const cookieExtractor = (socket) => {
  let token = null;

  if (socket) {
    const cookies = socket.headers.cookie;
    const parsedCookies = cookie.parse(cookies || '');
    token = parsedCookies.accessToken;
  }

  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: ENV.JWT_SECRET_KEY01,
};

const passportTokenAuth = new Passport();

// 토큰 유효성만 점검
passportTokenAuth.use(
  new Strategy(opts, async (jwt_payload, done) => {
    console.log('passportTokenAuth user 정보 : ', jwt_payload);

    if (jwt_payload) {
      return done(null, jwt_payload);
    }
    return done(null, false);
  })
);

export default passportTokenAuth;
