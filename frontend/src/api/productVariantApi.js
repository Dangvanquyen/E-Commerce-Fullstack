import axiosClient from "./axiosClient";

const productVariantApi = {
    // Lấy tất cả biến thể của sản phẩm
    getBySanPhamId(sanPhamId) {
        return axiosClient.get(`/SanPhamChiTiet/sanpham/${sanPhamId}`);
    },

    // Lấy biến thể có phân trang, tìm kiếm và lọc
    getPaged(params) {
        return axiosClient.get('/SanPhamChiTiet/paged', { params });
    },

    // Lấy thống kê kho hàng
    getInventoryStats() {
        return axiosClient.get('/SanPhamChiTiet/inventory-stats');
    },

    // Cập nhật nhanh số lượng tồn kho
    updateInventory(id, soLuong) {
        return axiosClient.patch(`/SanPhamChiTiet/${id}/inventory`, null, {
            params: { soLuong }
        });
    },

    // Lấy chi tiết biến thể
    getById(id) {
        return axiosClient.get(`/SanPhamChiTiet/${id}`);
    },

    // Tạo biến thể mới
    create(data) {
        return axiosClient.post('/SanPhamChiTiet', data);
    },

    // Cập nhật biến thể
    update(id, data) {
        return axiosClient.put(`/SanPhamChiTiet/${id}`, data);
    },

    // Xóa biến thể
    delete(id) {
        return axiosClient.delete(`/SanPhamChiTiet/${id}`);
    }
};

export default productVariantApi;