import RedisManager from '../../../common/redis/redisManager';
import chatTemplate from '../utils/chatTemplate';

const redisClient = RedisManager.getClient();

// 새로운 채팅방 참가자 발생!! => 레디스 채팅방 활성화 확인
// 레디스에 채팅방이 없으면 활성화(=초기화), 데이터 삽입
// 레디스에 채팅방이 있으면 활성화 유지, 새로운 참가자 레디스 추가
// 이렇게 해야지 레디스의 채팅방 정보가 확실해지고, 소캣만으로 유저가 옳은 참가자인지 판단가능
const joinChatRoom = async (chatRoomId, bodyData) => {
  // 채팅방이 존재하는지는 백엔드에서 확인하고 온거임 활성화만 안되어있을 뿐
  const { chatRoomData, userData } = bodyData;

  // 채팅방 데이터 템플릿(레디스 저장 형태)
  const chatRoomInfoKey = `chat-room:${chatRoomId}-info`;
  const chatRoomMembersKey = `chat-room:${chatRoomId}-members`;
  const chatRoomMessagesKey = `chat-room:${chatRoomId}-messages`;
  const chatRoomVideoMembersKey = `chat-room:${chatRoomId}-video-members`;

  // 채팅방 활성화 확인(래디스에 채팅방 정보 있는지 확인)
  const chatRoomInfo = await redisClient.hGetAll(chatRoomInfoKey);

  // 유저(채팅 참가자) 데이터 템플릿화
  const userTemplate = chatTemplate.createUserTemplate(userData);

  // 채팅방 활성화 여부에 따라
  // 활성화 안되어있음 => 채팅방 활성화 + 채팅방 기본 정보 갱신
  // 활성화 되어있음 => 채팅방 기본 정보 갱신
  if (Object.keys(chatRoomInfo).length === 0) {
    const chatRoomInfoTemplate =
      chatTemplate.createChatRoomInfoTemplate(chatRoomData);

    await redisClient.hSet(chatRoomInfoKey, chatRoomInfoTemplate);
    await redisClient.hSet(
      chatRoomMembersKey,
      userData.id.toString(),
      JSON.stringify(userTemplate)
    );
    // await redisClient.rPush(chatRoomMessagesKey, JSON.stringify('')); // 그냥 채팅 내역은 없는 상태로 생성
  } else {
    await redisClient.hSet(
      chatRoomMembersKey,
      userData.id.toString(),
      JSON.stringify(userTemplate)
    );
  }

  // 최신화된 상태의 채팅방 데이터를 Redis에서 가져오기 (화상채팅 인원포함)
  const updatedChatRoomInfo = await redisClient.hGetAll(chatRoomInfoKey);
  const updatedChatRoomMembers = await redisClient.hGetAll(chatRoomMembersKey);
  const updatedChatRoomMessages = await redisClient.lRange(
    chatRoomMessagesKey,
    1,
    -1
  );
  const updatedChatRoomVideoMembers = await redisClient.hGetAll(
    chatRoomVideoMembersKey
  );

  // 멤버 정보가 해쉬형태로 저장되어 {유저아이디 : {유저정보}, 유저아이디 : {유저정보}} 이렇게 들어있다.
  // 프론트에서 사용하기 편하게 유저정보만 뽑아서 배열로 변형 (어차피 유저정보에 아이디 있음)
  const parsedUpdatedMembers = Object.keys(updatedChatRoomMembers).reduce(
    (acc, userId) => {
      acc[userId] = JSON.parse(updatedChatRoomMembers[userId]); // JSON 문자열을 객체로 변환
      return acc;
    },
    {}
  );

  const parsedUpdatedVideoMembers = Object.keys(
    updatedChatRoomVideoMembers
  ).reduce((acc, userId) => {
    acc[userId] = JSON.parse(updatedChatRoomVideoMembers[userId]); // JSON 문자열을 객체로 변환
    return acc;
  }, {});

  console.log(`parsedUpdatedVideoMembers: ${parsedUpdatedVideoMembers}`);
  console.log(parsedUpdatedVideoMembers);

  // 최신 메시지들을 문자열을 json형태로
  const parsedUpdatedMessages = updatedChatRoomMessages.map((message) =>
    JSON.parse(message)
  );

  // 키를 제외하고 값들만 묶어서 새로운 배열 생성
  const membersValues = Object.values(parsedUpdatedMembers);
  const videoMembersValues = Object.values(parsedUpdatedVideoMembers);

  // 최신화된 채팅방 정보 전달 (채팅방 정보, 참가자 리스트, 최근 메시지 목록)
  // 이거 이제 반환안해줄 거임, 채팅방 정보는 무조건 소캣을 통해서 한다.
  // 여기서는 데이터베이스 기반으로 레디스에 채팅방 기초구조만 쌓기
  return {
    chatRoomInfo: updatedChatRoomInfo,
    chatRoomMembers: membersValues,
    chatRoomMessages: parsedUpdatedMessages,
    chatRoomVideoMembers: videoMembersValues,
  };
  // 이걸로 방참가 기초는 다 했으니 리액트가 이거 문제없으면 방참가 메시지를 보내면 됨
};

const ChatService = { joinChatRoom };

export default ChatService;
