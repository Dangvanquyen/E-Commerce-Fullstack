import axiosClient from './axiosClient';

const notificationApi = {
  /**
   * Lấy danh sách thông báo cho khách hàng
   */
  getNotifications(limit = 20) {
    return axiosClient.get('/ThongBao', { params: { limit } });
  },

  /**
   * Lấy danh sách thông báo cho Admin
   */
  getAdminNotifications(limit = 20) {
    return axiosClient.get('/ThongBao/admin', { params: { limit } });
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  getUnreadCount() {
    return axiosClient.get('/ThongBao/unread-count');
  },

  /**
   * Đánh dấu đã đọc một thông báo
   */
  markAsRead(id) {
    return axiosClient.put(`/ThongBao/read/${id}`);
  },

  /**
   * Đánh dấu tất cả thông báo của user/admin hiện tại là đã đọc
   */
  markAllAsRead() {
    return axiosClient.put('/ThongBao/read-all');
  },
};

export default notificationApi;
