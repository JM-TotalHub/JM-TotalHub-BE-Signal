// config.js
import dotenv from 'dotenv';
dotenv.config(); // 환경 변수 로드

const ENV = {
  SIGNAL_SERVER_REDIS_URL: process.env.SIGNAL_SERVER_REDIS_URL,
  SIGNAL_SERVER_REDIS_PORT: process.env.SIGNAL_SERVER_REDIS_PORT,
  SIGNAL_SERVER_REDIS_PASSWORD: process.env.SIGNAL_SERVER_REDIS_PASSWORD,

  REACT_LOCAL_HOST: process.env.REACT_LOCAL_HOST,
  REACT_LOCAL_PORT: process.env.REACT_LOCAL_PORT,
};

export default ENV;
