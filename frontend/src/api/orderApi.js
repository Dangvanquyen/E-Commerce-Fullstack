import axiosClient from "./axiosClient";

const orderApi = {
    // Lấy đơn hàng của user hiện tại
    getMyOrders() {
        return axiosClient.get('/DonHang/my-orders');
    },

    // Lấy đơn hàng có phân trang
    getMyOrdersPaged(pageNumber = 1, pageSize = 10) {
        return axiosClient.get('/DonHang/my-orders/paged', {
            params: { pageNumber, pageSize }
        });
    },

    // Lấy chi tiết đơn hàng theo ID
    getById(id) {
        return axiosClient.get(`/DonHang/${id}`);
    },

    // Tạo đơn hàng từ giỏ hàng (Checkout)
    checkout(diaChiGiaoHang, phuongThucThanhToan, voucherCode = null, gioHangChiTietIds = null) {
        return axiosClient.post('/DonHang/checkout', {
            diaChiGiaoHang,
            phuongThucThanhToan,
            voucherCode,
            gioHangChiTietIds
        });
    },

    // Tạo đơn hàng trực tiếp (Mua ngay - không qua giỏ hàng)
    checkoutDirect(data) {
        return axiosClient.post('/DonHang/checkout-direct', data);
    },

    // Hủy đơn hàng
    cancelOrder(id) {
        return axiosClient.patch(`/DonHang/${id}/cancel`);
    }
};

export default orderApi;
