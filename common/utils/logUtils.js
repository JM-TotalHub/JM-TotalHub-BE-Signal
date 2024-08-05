export function logTimer() {
  return new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
}
