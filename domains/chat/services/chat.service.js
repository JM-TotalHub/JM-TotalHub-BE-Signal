import RedisManager from '../../../common/redis/redisManager';
import chatTemplate from '../utils/chatTemplate';

const redisClient = RedisManager.getClient();

const joinChatRoom = async (chatRoomId, bodyData) => {
  const { chatRoomData, userData } = bodyData;
  console.log('userData : ', userData);

  const chatRoomInfoKey = `chat-room:${chatRoomId}-info`;
  const chatRoomMembersKey = `chat-room:${chatRoomId}-members`;
  const chatRoomMessagesKey = `chat-room:${chatRoomId}-messages`;

  const chatRoomInfo = await redisClient.hGetAll(chatRoomInfoKey);

  console.log('데이터 확인: ', userData);

  const userTemplate = chatTemplate.createUserTemplate(userData);

  console.log('데이터 확인2 : ', userTemplate);

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

  // 최종적으로 Redis에서 채팅방 정보를 가져옵니다.
  const updatedChatRoomInfo = await redisClient.hGetAll(chatRoomInfoKey);
  const updatedChatRoomMembers = await redisClient.hGetAll(chatRoomMembersKey);
  const updatedChatRoomMessages = await redisClient.lRange(
    chatRoomMessagesKey,
    1,
    -1
  );

  console.log('updatedChatRoomMembers : ', updatedChatRoomMembers);

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

  return {
    chatRoomInfo: updatedChatRoomInfo,
    chatRoomMembers: membersValues,
    chatRoomMessages: updatedChatRoomMessages,
  };
};

const ChatService = { joinChatRoom };

export default ChatService;
