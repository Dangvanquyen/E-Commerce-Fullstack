import axiosClient from "./axiosClient";

const adminCartApi = {
    getAbandonedCarts() {
        return axiosClient.get('/GioHang/admin/abandoned');
    },

    getAbandonedProducts() {
        return axiosClient.get('/GioHang/admin/abandoned-products');
    }
};

export default adminCartApi;
