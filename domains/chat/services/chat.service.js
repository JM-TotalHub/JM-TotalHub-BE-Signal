import RedisManager from '../../../common/redis/redisManager';
import chatTemplate from '../utils/chatTemplate';

const redisClient = RedisManager.getClient();

const joinChatRoom = async (chatRoomId, bodyData) => {
  // 채팅방이 존재하는지는 백엔드에서 확인하고 온거임 활성화만 안되어있을 뿐
  const { chatRoomData, userData } = bodyData;

  // 채팅방 데이터 템플릿(레디스 저장 형태)
  const chatRoomInfoKey = `chat-room:${chatRoomId}-info`;
  const chatRoomMembersKey = `chat-room:${chatRoomId}-members`;
  const chatRoomMessagesKey = `chat-room:${chatRoomId}-messages`;

  // 채팅방 활성화 확인(래디스에 채팅방 정보 있는지 확인)
  const chatRoomInfo = await redisClient.hGetAll(chatRoomInfoKey);

  // 유저(채팅 참가자) 데이터 템플릿화
  const userTemplate = chatTemplate.createUserTemplate(userData);

  console.log('userData : ', userData);
  console.log('userTemplate : ', userTemplate);

  // 채팅방 활성화 여부에 따라
  // 활성화 안되어있음 => 채팅방 활성화 + 참가자 목록 갱신(유저추가)
  // 활성화 되어있음 => 참가자 목록 갱신(유저추가)
  if (Object.keys(chatRoomInfo).length === 0) {
    const chatRoomInfoTemplate =
      chatTemplate.createChatRoomInfoTemplate(chatRoomData);

    await redisClient.hSet(chatRoomInfoKey, chatRoomInfoTemplate);

    await redisClient.hSet(
      chatRoomMembersKey,
      userData.id.toString(),
      JSON.stringify(userTemplate)
    );
    await redisClient.rPush(chatRoomMessagesKey, JSON.stringify(''));
  } else {
    await redisClient.hSet(
      chatRoomMembersKey,
      userData.id.toString(),
      JSON.stringify(userTemplate)
    );
  }

  // 최신화된 상태의 채팅방 데이터를 Redis에서 가져오기
  const updatedChatRoomInfo = await redisClient.hGetAll(chatRoomInfoKey);
  const updatedChatRoomMembers = await redisClient.hGetAll(chatRoomMembersKey);
  const updatedChatRoomMessages = await redisClient.lRange(
    chatRoomMessagesKey,
    1,
    -1
  );

  console.log('updatedChatRoomMembers : ', updatedChatRoomMembers);

  // 멤버 정보가 해쉬형태로 저장되어 {유저아이디 : {유저정보}, 유저아이디 : {유저정보}} 이렇게 들어있다.
  // 프론트에서 사용하기 편하게 유저정보만 뽑아서 배열로 변형 (어차피 유저정보에 아이디 있음)
  const parsedUpdatedMembers = Object.keys(updatedChatRoomMembers).reduce(
    (acc, userId) => {
      acc[userId] = JSON.parse(updatedChatRoomMembers[userId]); // JSON 문자열을 객체로 변환
      return acc;
    },
    {}
  );

  console.log('parsedUpdatedMembers : ', parsedUpdatedMembers);

  // 키를 제외하고 값들만 묶어서 새로운 배열 생성
  const membersValues = Object.values(parsedUpdatedMembers);

  console.log('membersValues : ', membersValues);

  // 최신화된 채팅방 정보 전달 (채팅방 정보, 참가자 리스트, 최근 메시지 목록)
  return {
    chatRoomInfo: updatedChatRoomInfo,
    chatRoomMembers: membersValues,
    chatRoomMessages: updatedChatRoomMessages,
  };
  // 이걸로 방참가 기초는 다 했으니 리액트가 이거 문제없으면 방참가 메시지를 보내면 됨
};

const ChatService = { joinChatRoom };

export default ChatService;
