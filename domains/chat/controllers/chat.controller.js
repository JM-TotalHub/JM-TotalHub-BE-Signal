import ChatService from '../services/chat.service';

const chatRoomJoin = async (req, res) => {
  const { chatRoomId } = req.params;
  const bodyData = req.body;

  await ChatService.joinChatRoom(chatRoomId, bodyData);
  res.status(201).json(); // 성공 시 201 상태 코드 반환
};

const ChatController = { chatRoomJoin };

export default ChatController;
