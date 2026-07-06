import axiosClient from "./axiosClient";

const userApi = {
    // Lấy tất cả người dùng
    getAll() {
        return axiosClient.get('/NguoiDung');
    },

    // Lấy người dùng có phân trang
    getPaged(pageNumber = 1, pageSize = 10) {
        return axiosClient.get('/NguoiDung/paged', {
            params: { pageNumber, pageSize }
        });
    },

    // Lấy chi tiết người dùng
    getById(id) {
        return axiosClient.get(`/NguoiDung/${id}`);
    },

    // Lấy người dùng theo vai trò
    getByRole(vaiTroId) {
        return axiosClient.get(`/NguoiDung/vaitro/${vaiTroId}`);
    },

    // Tạo người dùng mới (dùng register API)
    create(data) {
        return axiosClient.post('/Auth/Register', data);
    },

    // Cập nhật người dùng
    update(id, data) {
        return axiosClient.put(`/NguoiDung/${id}`, data);
    },

    // Cập nhật trạng thái
    updateStatus(id, trangThai) {
        return axiosClient.patch(`/NguoiDung/${id}/status`, null, {
            params: { trangThai }
        });
    },

    // Cập nhật vai trò
    updateRole(id, vaiTroId) {
        return axiosClient.patch(`/NguoiDung/${id}/role`, null, {
            params: { vaiTroId }
        });
    },

    // Xóa người dùng
    delete(id) {
        return axiosClient.delete(`/NguoiDung/${id}`);
    },

    // Lấy danh sách vai trò
    getRoles() {
        return axiosClient.get('/VaiTro');
    }
};

export default userApi;
