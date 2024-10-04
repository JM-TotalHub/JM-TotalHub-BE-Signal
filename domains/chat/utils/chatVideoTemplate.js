const createUserTemplate = (userData, socketId) => {
  return {
    id: userData.id || null,
    email: userData.email || 'No email provided',
    nickname: userData.nickname || 'Anonymous',
    loginType: userData.loginType || 'guest',
    roleType: userData.roleType || 'user',
    socketId: socketId || 'No Socket Id',
  };
};

const chatVideoTemplate = {
  createUserTemplate,
};

export default chatVideoTemplate;
