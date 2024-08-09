import ChatService from '../services/chat.service';

const chatRoomJoin = async (req, res) => {
  console.log('채팅방 참가 요청 들어옴');

  const { chatRoomId } = req.params;
  const bodyData = req.body;

  const updatedChatRoomData = await ChatService.joinChatRoom(
    chatRoomId,
    bodyData
  );

  res.status(201).json(updatedChatRoomData); // 성공 시 201 상태 코드 반환
};

const ChatController = { chatRoomJoin };

export default ChatController;
