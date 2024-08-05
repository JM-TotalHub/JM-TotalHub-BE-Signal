import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { logTimer } from '../utils/logUtils';

/**
 * RedisAdapter 을 통한 시그널 서버 인스턴스 연결, 관리
 * 복수의 시그널 서버를 레디스를 통해 연결한다.
 */
class RedisSession {
  constructor() {
    this.pub = createClient({
      url: `redis://${process.env.SIGNAL_SERVER_REDIS_URL}:${process.env.SIGNAL_SERVER_REDIS_PORT}`,
      password: process.env.SIGNAL_SERVER_REDIS_PASSWORD,
    });

    this.sub = this.pub.duplicate();
  }

  async init(socketIO) {
    try {
      await Promise.all([this.pub.connect(), this.sub.connect()]).then(() => {
        socketIO.adapter(createAdapter(this.pub, this.sub));
        console.log('소캣 RedisAdapter 연결 성공');
      });
      return this.pub;
    } catch (error) {
      console.log('소캣 RedisAdapter 연결 실패 : ' + error);
    }
  }

  async startMonitor(redisClient) {
    try {
      setInterval(async () => {
        if (redisClient) {
          const memoryInfos = await redisClient.info('memory');
          const usedMemory = memoryInfos
            .split('\n')
            .find((line) => line.match(/used_memory_human/))
            .split(':')[1]
            .trim();
          const maxMemory = memoryInfos
            .split('\n')
            .find((line) => line.match(/maxmemory_human/))
            .split(':')[1]
            .trim();
          const totalSystemMemory = memoryInfos
            .split('\n')
            .find((line) => line.match(/total_system_memory_human/))
            .split(':')[1]
            .trim();

          console.log(
            `${logTimer()} [MEMORY] Redis 사용 중인 메모리: ${usedMemory}, 전체 시스템 메모리: ${totalSystemMemory}`
          );
        } else {
          console.log('레디스 연결되지 않아 정보 파악 불가...');
        }
      }, 60000); // 60초마다 메모리 사용량 로그 출력
    } catch (error) {
      console.error('Redis 초기화 중 오류 발생:', error);
    }
  }
}

export default RedisSession;
