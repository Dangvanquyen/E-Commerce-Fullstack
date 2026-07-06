import axiosClient from "./axiosClient";

const productApi = {
  // Lấy tất cả sản phẩm
  getAll() {
    return axiosClient.get('/SanPham');
  },

  // Lấy sản phẩm đang hoạt động
  getActive() {
    return axiosClient.get('/SanPham/active');
  },

  // Lấy sản phẩm có phân trang
  getPaged(pageNumber = 1, pageSize = 10) {
    return axiosClient.get('/SanPham/paged', {
      params: { pageNumber, pageSize }
    });
  },

  // Lấy chi tiết sản phẩm theo ID
  getById(id) {
    return axiosClient.get(`/SanPham/${id}`);
  },

  // Lấy sản phẩm theo danh mục
  getByCategory(danhMucId) {
    return axiosClient.get(`/SanPham/danhmuc/${danhMucId}`);
  },

  // Tìm kiếm sản phẩm
  search(keyword) {
    return axiosClient.get('/SanPham/search', {
      params: { keyword }
    });
  },

  // Lấy gợi ý sản phẩm mua kèm (thuật toán Apriori)
  getRecommendations(productId, limit = 4) {
    return axiosClient.get(`/Recommendation/product/${productId}`, {
      params: { limit }
    });
  }
};

export default productApi;
