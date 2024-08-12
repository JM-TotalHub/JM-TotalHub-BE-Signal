import ChatService from '../services/chat.service';

const chatRoomJoin = async (req, res) => {
  console.log('채팅방 참가 요청 들어옴');

  const { chatRoomId } = req.params;
  const bodyData = req.body;

  let updatedChatRoomData;

  try {
    // const updatedChatRoomData = await ChatService.joinChatRoom(
    updatedChatRoomData = await ChatService.joinChatRoom(chatRoomId, bodyData);
  } catch (error) {
    console.log('서비스 로직 에러 : ', error);
  }

  res.status(201).json(updatedChatRoomData); // 성공 시 201 상태 코드 반환
};

const ChatController = { chatRoomJoin };

export default ChatController;
