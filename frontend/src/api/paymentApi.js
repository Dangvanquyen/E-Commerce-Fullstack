import axiosClient from "./axiosClient";

const paymentApi = {
  // Tạo URL thanh toán VNPay
  createVnPayUrl(paymentData) {
    return axiosClient.post('/Payment/create-payment-url', paymentData);
  },

  // Xử lý callback từ VNPay
  handleCallback(queryParams) {
    return axiosClient.get('/Payment/payment-callback', { params: queryParams });
  }
};

export default paymentApi;
