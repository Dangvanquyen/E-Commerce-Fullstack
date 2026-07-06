import axiosClient from "./axiosClient";

const authApi = {
  login(data) {
    const url = '/Auth/login';
    return axiosClient.post(url, data);
  },

  register(data) {
    const url = '/Auth/register';
    return axiosClient.post(url, data);
  },

  changePassword(data) {
    const url = '/Auth/change-password';
    // Convert camelCase to PascalCase for backend
    return axiosClient.post(url, {
      CurrentPassword: data.currentPassword,
      NewPassword: data.newPassword,
      ConfirmPassword: data.confirmPassword
    });
  },

  forgotPassword(email) {
    const url = '/Auth/forgot-password';
    return axiosClient.post(url, {
      Email: email
    });
  },

  resetPassword(data) {
    const url = '/Auth/reset-password';
    return axiosClient.post(url, {
      Email: data.email,
      Code: data.code,
      NewPassword: data.newPassword
    });
  }
};

export default authApi;