import axiosClient from "./axiosClient";

const wishlistApi = {
    // Lấy danh sách yêu thích
    getMyWishlist() {
        return axiosClient.get('/YeuThich');
    },

    // Kiểm tra sản phẩm có trong wishlist không
    checkInWishlist(sanPhamId) {
        return axiosClient.get(`/YeuThich/check/${sanPhamId}`);
    },

    // Toggle yêu thích (thêm/xóa)
    toggleWishlist(sanPhamId) {
        return axiosClient.post(`/YeuThich/toggle/${sanPhamId}`);
    },

    // Xóa khỏi wishlist
    removeFromWishlist(sanPhamId) {
        return axiosClient.delete(`/YeuThich/${sanPhamId}`);
    }
};

export default wishlistApi;
