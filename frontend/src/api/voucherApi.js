import axiosClient from "./axiosClient";

const voucherApi = {
  // Lấy tất cả mã giảm giá (Admin)
  getAll() {
    return axiosClient.get('/MaGiamGia');
  },

  // Lấy danh sách mã giảm giá có phân trang (Admin)
  getPaged(pageNumber = 1, pageSize = 10) {
    return axiosClient.get('/MaGiamGia/paged', {
      params: { pageNumber, pageSize }
    });
  },

  // Lấy các mã giảm giá đang hoạt động (Public / Shop Checkout)
  getActive() {
    return axiosClient.get('/MaGiamGia/active');
  },

  // Lấy chi tiết mã giảm giá theo ID (Admin)
  getById(id) {
    return axiosClient.get(`/MaGiamGia/${id}`);
  },

  // Tạo mới mã giảm giá (Admin)
  create(data) {
    return axiosClient.post('/MaGiamGia', data);
  },

  // Cập nhật mã giảm giá (Admin)
  update(id, data) {
    return axiosClient.put(`/MaGiamGia/${id}`, data);
  },

  // Xóa mã giảm giá (Admin)
  delete(id) {
    return axiosClient.delete(`/MaGiamGia/${id}`);
  },

  // Cập nhật trạng thái hoạt động (Admin)
  updateStatus(id, trangThai) {
    return axiosClient.patch(`/MaGiamGia/${id}/status`, null, {
      params: { trangThai }
    });
  },

  // Kiểm tra mã giảm giá (User)
  validate(code, orderAmount) {
    return axiosClient.post('/MaGiamGia/validate', {
      Code: code,
      OrderAmount: orderAmount
    });
  }
};

export default voucherApi;
