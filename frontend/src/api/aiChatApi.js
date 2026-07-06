import axiosClient from './axiosClient';

const aiChatApi = {
  /**
   * Gửi tin nhắn đến AI chatbot (không cần đăng nhập)
   * @param {string} message - Tin nhắn của người dùng
   * @param {Array} history - Lịch sử hội thoại [{role: 'user'|'model', content: '...'}]
   */
  sendMessage: (message, history = []) => {
    return axiosClient.post('/aichat/send', { message, history });
  }
};

export default aiChatApi;
