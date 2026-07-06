import axiosClient from "./axiosClient";

const adminProductApi = {
    // Lấy tất cả sản phẩm
    getAll() {
        return axiosClient.get('/SanPham');
    },

    // Lấy sản phẩm có phân trang
    getPaged(pageNumber = 1, pageSize = 10) {
        return axiosClient.get('/SanPham/paged', {
            params: { pageNumber, pageSize }
        });
    },

    // Lấy chi tiết sản phẩm
    getById(id) {
        return axiosClient.get(`/SanPham/${id}`);
    },

    // Tìm kiếm sản phẩm
    search(keyword) {
        return axiosClient.get('/SanPham/search', {
            params: { keyword }
        });
    },

    // Lấy sản phẩm theo danh mục
    getByCategory(danhMucId) {
        return axiosClient.get(`/SanPham/danhmuc/${danhMucId}`);
    },

    // Tạo sản phẩm mới
    create(data) {
        return axiosClient.post('/SanPham', data);
    },

    // Cập nhật sản phẩm
    update(id, data) {
        return axiosClient.put(`/SanPham/${id}`, data);
    },

    // Xóa sản phẩm
    delete(id) {
        return axiosClient.delete(`/SanPham/${id}`);
    },

    // Cập nhật trạng thái
    updateStatus(id, trangThai) {
        return axiosClient.patch(`/SanPham/${id}/status`, null, {
            params: { trangThai }
        });
    }
};

export default adminProductApi;
