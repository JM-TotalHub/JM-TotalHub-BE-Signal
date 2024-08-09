const createChatRoomInfoTemplate = (chatRoomData) => {
  return {
    id: chatRoomData.id,
    name: chatRoomData.name || 'Unnamed Chat Room',
    description: chatRoomData.description || 'No description provided',
    chat_type: chatRoomData.chat_type || 'general',
    created_at: chatRoomData.created_at || new Date().toISOString(),
    updated_at: chatRoomData.updated_at || new Date().toISOString(),
    user_id: chatRoomData.user_id ? chatRoomData.user_id : null,
  };
};

const createUserTemplate = (userData) => {
  return {
    id: userData.id || null,
    email: userData.email || 'No email provided',
    nickname: userData.nickname || 'Anonymous',
    loginType: userData.loginType || 'guest',
    roleType: userData.roleType || 'user',
  };
};

const createMessageTemplate = (userId, messageContent) => {
  return {
    userId: userId || null,
    content: messageContent || 'No content',
    timestamp: new Date().toISOString(),
    type: 'text', // 기본 메시지 타입
    status: 'sent', // 기본 메시지 상태
  };
};

const chatTemplate = {
  createChatRoomInfoTemplate,
  createUserTemplate,
  createMessageTemplate,
};

export default chatTemplate;
