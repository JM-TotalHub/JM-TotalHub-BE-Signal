function getExpirationInSeconds(expiration) {
  console.log('Expiration value:', expiration);
  const unit = expiration.slice(-1); // 단위 추출 (d, h)
  const value = parseInt(expiration.slice(0, -1), 10); // 값 추출

  if (unit === 'h') {
    return value * 60 * 60;
  } else if (unit === 'd') {
    return value * 24 * 60 * 60;
  } else if (unit === 'm') {
    return value * 60;
  } else if (unit === 's') {
    return value;
  } else {
    return parseInt(expiration);
  }
}

export default getExpirationInSeconds;
