// config.js
import dotenv from 'dotenv';
dotenv.config(); // 환경 변수 로드

const isProd = process.env.SIGNAL_SERVER_ENV_STATUS === 'prod';

const ENV = {
  EXPRESS_SERVER_BASE_URL: isProd
    ? `http://${process.env.NGINX_SERVER_EC2_HOST}/api`
    : `http://${process.env.EXPRESS_LOCAL_HOST}:${process.env.EXPRESS_LOCAL_POST}`,

  CORS_REACT_SERVER_BASE_URL: isProd
    ? `http://${process.env.NGINX_SERVER_EC2_HOST}`
    : `http://${process.env.REACT_LOCAL_HOST}:${process.env.REACT_LOCAL_PORT}`,

  SIGNAL_SERVER_REDIS_URL: process.env.SIGNAL_SERVER_REDIS_URL,
  SIGNAL_SERVER_REDIS_PORT: process.env.SIGNAL_SERVER_REDIS_PORT,
  SIGNAL_SERVER_REDIS_PASSWORD: process.env.SIGNAL_SERVER_REDIS_PASSWORD,

  REACT_LOCAL_HOST: process.env.REACT_LOCAL_HOST,
  REACT_LOCAL_PORT: process.env.REACT_LOCAL_PORT,

  JWT_ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_TOKEN_EXPIRATION,
  JWT_REFRESH_TOKEN_EXPIRATION: process.env.JWT_REFRESH_TOKEN_EXPIRATION,
  JWT_SECRET_KEY01: process.env.JWT_SECRET_KEY01,
};

export default ENV;
