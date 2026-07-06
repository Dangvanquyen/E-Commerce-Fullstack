import axiosClient from './axiosClient';

const chatApi = {
  // Lấy hoặc tạo chat room cho user hiện tại
  getOrCreateChatRoom: () => {
    return axiosClient.get('/chat/room');
  },

  // Gửi tin nhắn
  sendMessage: (data) => {
    return axiosClient.post('/chat/send', data);
  },

  // Admin: Lấy danh sách chat rooms
  getActiveChatRooms: () => {
    return axiosClient.get('/chat/rooms');
  },

  // Admin: Lấy chi tiết chat room với tin nhắn
  getChatRoomWithMessages: (chatRoomId) => {
    return axiosClient.get(`/chat/room/${chatRoomId}`);
  },

  // Đánh dấu tin nhắn đã đọc
  markMessagesAsRead: (chatRoomId) => {
    return axiosClient.post(`/chat/room/${chatRoomId}/mark-read`);
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadMessageCount: (chatRoomId) => {
    return axiosClient.get(`/chat/room/${chatRoomId}/unread-count`);
  },

  // Admin: Lấy danh sách user online
  getOnlineUsers: () => {
    return axiosClient.get('/chat/online-users');
  }
};

export default chatApi;