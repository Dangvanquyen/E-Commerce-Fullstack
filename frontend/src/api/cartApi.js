import axiosClient from "./axiosClient";

const cartApi = {
    // Lấy giỏ hàng của user hiện tại
    getMyCart() {
        return axiosClient.get('/GioHang');
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart(sanPhamChiTietId, soLuong = 1) {
        return axiosClient.post('/GioHangChiTiet', {
            sanPhamChiTietId,
            soLuong
        });
    },

    // Cập nhật số lượng sản phẩm trong giỏ
    updateQuantity(id, soLuong) {
        return axiosClient.put(`/GioHangChiTiet/${id}`, {
            soLuong
        });
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart(id) {
        return axiosClient.delete(`/GioHangChiTiet/${id}`);
    },

    // Xóa toàn bộ giỏ hàng
    clearCart() {
        return axiosClient.delete('/GioHang');
    }
};

export default cartApi;
