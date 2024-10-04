import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { logTimer } from '../utils/logUtils';
import ENV from '../utils/env';

/**
 * RedisAdapter을 통한 시그널 서버 인스턴스 연결, 관리
 * 복수의 시그널 서버를 레디스를 통해 연결한다.
 */
const RedisSessionManager = (() => {
  let pub = null;
  let sub = null;

  const connect = async (socketIO) => {
    if (!pub) {
      pub = createClient({
        url: `redis://${ENV.SIGNAL_SERVER_REDIS_URL}:${ENV.SIGNAL_SERVER_REDIS_PORT}`,
        password: ENV.SIGNAL_SERVER_REDIS_PASSWORD,
      });

      sub = pub.duplicate();

      try {
        await Promise.all([pub.connect(), sub.connect()]);
        socketIO.adapter(createAdapter(pub, sub));
        console.log('소캣 RedisAdapter 연결 성공');
        return pub; // 퍼블리셔를 반환
      } catch (error) {
        console.error('소캣 RedisAdapter 연결 실패 :', error);
        throw error; // 연결 실패 시 예외 발생
      }
    }
  };

  const startMonitor = async () => {
    try {
      setInterval(async () => {
        if (pub && pub.isOpen) {
          const memoryInfos = await pub.info('memory');
          const usedMemory = memoryInfos
            .split('\n')
            .find((line) => line.match(/used_memory_human/))
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
      console.error('Redis 모니터링 중 오류 발생:', error);
    }
  };

  return {
    connect,
    startMonitor,
  };
})();

export default RedisSessionManager;
