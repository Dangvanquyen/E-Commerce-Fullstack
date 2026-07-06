import axiosClient from "./axiosClient";

const adminOrderApi = {
    // Lấy tất cả đơn hàng
    getAll() {
        return axiosClient.get('/DonHang');
    },

    // Lấy đơn hàng có phân trang
    getPaged(pageNumber = 1, pageSize = 10) {
        return axiosClient.get('/DonHang/paged', {
            params: { pageNumber, pageSize }
        });
    },

    // Lấy chi tiết đơn hàng
    getById(id) {
        return axiosClient.get(`/DonHang/${id}`);
    },

    // Lấy đơn hàng theo trạng thái
    getByStatus(trangThai) {
        return axiosClient.get(`/DonHang/status/${trangThai}`);
    },

    // Cập nhật trạng thái đơn hàng
    updateStatus(id, trangThai) {
        return axiosClient.patch(`/DonHang/${id}/status`, { trangThai });
    },

    // Xóa đơn hàng
    delete(id) {
        return axiosClient.delete(`/DonHang/${id}`);
    }
};

export default adminOrderApi;
