import axiosClient from "./axiosClient";

const categoryApi = {
    // Lấy tất cả danh mục
    getAll() {
        return axiosClient.get('/DanhMuc');
    },

    // Lấy danh mục active
    getActive() {
        return axiosClient.get('/DanhMuc/active');
    },

    // Lấy danh mục có phân trang
    getPaged(pageNumber = 1, pageSize = 10) {
        return axiosClient.get('/DanhMuc/paged', {
            params: { pageNumber, pageSize }
        });
    },

    // Lấy chi tiết danh mục
    getById(id) {
        return axiosClient.get(`/DanhMuc/${id}`);
    },

    // Tạo danh mục mới
    create(data) {
        return axiosClient.post('/DanhMuc', data);
    },

    // Cập nhật danh mục
    update(id, data) {
        return axiosClient.put(`/DanhMuc/${id}`, data);
    },

    // Xóa danh mục
    delete(id) {
        return axiosClient.delete(`/DanhMuc/${id}`);
    },

    // Cập nhật trạng thái
    updateStatus(id, trangThai) {
        return axiosClient.patch(`/DanhMuc/${id}/status`, null, {
            params: { trangThai }
        });
    }
};

export default categoryApi;
