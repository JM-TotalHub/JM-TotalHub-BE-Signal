let io; // 소켓 서버 인스턴스를 저장할 변수

const setSocketIO = (socketIO) => {
  io = socketIO; // 소켓 서버 인스턴스를 설정
};

// const setSocket =

const socketManager = {
  setSocketIO,
};

export default socketManager;
