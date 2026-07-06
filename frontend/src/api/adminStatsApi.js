import axiosClient from "./axiosClient";

const adminStatsApi = {
    getTongQuan() {
        return axiosClient.get('/ThongKe/tong-quan');
    },

    getDoanhThuTheoThang(nam) {
        return axiosClient.get('/ThongKe/doanh-thu/thang', { params: { nam } });
    },

    getDoanhThuTheoQuy(nam) {
        return axiosClient.get('/ThongKe/doanh-thu/quy', { params: { nam } });
    },

    getDoanhThuTheoNam(tuNam, denNam) {
        return axiosClient.get('/ThongKe/doanh-thu/nam', { params: { tuNam, denNam } });
    },

    getDoanhThuTheoSanPham(tuNgay, denNgay, top = 20) {
        return axiosClient.get('/ThongKe/doanh-thu/san-pham', {
            params: { tuNgay, denNgay, top }
        });
    },

    getDoanhThuTheoDanhMuc(tuNgay, denNgay) {
        return axiosClient.get('/ThongKe/doanh-thu/danh-muc', {
            params: { tuNgay, denNgay }
        });
    },

    // --- Tracking hành vi duyệt web ---
    getTopClickSanPham(tuNgay, denNgay, top = 20) {
        return axiosClient.get('/ThongKe/click/san-pham', {
            params: { tuNgay, denNgay, top }
        });
    },
};

export default adminStatsApi;
