import cron from 'node-cron';
import RedisChatQueueManager from '../redis/redisChatQueueManager';

// 스케줄 작업 등록
const startSchedulers = () => {
  // 매 5분마다 실행되는 작업
  cron.schedule('*/5 * * * *', () => {
    // cron.schedule('*/30 * * * * *', () => {
    // console.log('5분마다 실행되는 작업');
    RedisChatQueueManager.addQueue(null, 'save-messages', {
      message: '5분주기-채팅방 메시지 DB 저장.',
    });
  });
};

// startSchedulers 함수 내보내기
export default startSchedulers;
