import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({
    tenDangNhap: '',
    matKhau: ''
  });

  const [registerForm, setRegisterForm] = useState({
    tenDangNhap: '',
    matKhau: '',
    hoTen: '',
    email: '',
    soDienThoai: ''
  });

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginForm.tenDangNhap || !loginForm.matKhau) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const userData = await login(loginForm);

      toast.success("Đăng nhập thành công!");

      // Redirect dựa trên vai trò
      if (userData.vaiTro?.tenVaiTro === 'Admin' || userData.vaiTro === 'Admin') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (error) {
      toast.error(error.message || "Sai tên đăng nhập hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerForm.tenDangNhap || !registerForm.matKhau || !registerForm.hoTen || !registerForm.email) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.register(registerForm);
      
      if (response.success) {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegisterMode(false);
        setRegisterForm({
          tenDangNhap: '',
          matKhau: '',
          hoTen: '',
          email: '',
          soDienThoai: ''
        });
      }
    } catch (error) {
      toast.error(error.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      toast.warning("Vui lòng nhập email!");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.forgotPassword(forgotPasswordEmail.trim());
      if (response.success) {
        toast.success(response.message || "Mã OTP đã được gửi đến email của bạn.");
        setForgotPasswordStep(2);
      } else {
        toast.error(response.message || "Gửi yêu cầu thất bại.");
      }
    } catch (error) {
      toast.error(error.message || "Gửi yêu cầu thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      toast.warning("Vui lòng nhập mã xác nhận!");
      return;
    }
    if (!newPassword) {
      toast.warning("Vui lòng nhập mật khẩu mới!");
      return;
    }
    if (newPassword.length < 6) {
      toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.warning("Xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.resetPassword({
        email: forgotPasswordEmail.trim(),
        code: otpCode.trim(),
        newPassword: newPassword
      });

      if (response.success) {
        toast.success(response.message || "Đặt lại mật khẩu thành công!");
        setIsForgotPasswordMode(false);
        setForgotPasswordStep(1);
        setForgotPasswordEmail('');
        setOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        toast.error(response.message || "Đổi mật khẩu thất bại.");
      }
    } catch (error) {
      toast.error(error.message || "Đặt lại mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 relative overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ minHeight: '550px' }}>
          
          {/* Sliding Overlay Panel */}
          <div 
            className={`absolute top-0 h-full w-1/2 bg-gradient-to-br from-red-600 via-red-700 to-red-800 transition-all duration-700 ease-in-out z-20 flex items-center justify-center ${
              isRegisterMode ? 'left-0 rounded-r-3xl' : 'left-1/2 rounded-l-3xl'
            }`}
          >
            <div className="text-center px-12 text-white">
              {/* Logo */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold tracking-tight">Fashion<span className="text-pink-200">Store</span></h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <svg className="w-6 h-6 text-pink-200" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <span className="text-sm text-pink-100 font-medium">Thời trang hiện đại</span>
                </div>
              </div>

              {isRegisterMode ? (
                <>
                  <h2 className="text-3xl font-bold mb-3">Xin chào!</h2>
                  <p className="text-red-100 mb-8 text-sm">Đã có tài khoản? Đăng nhập ngay để mua sắm</p>
                  <button
                    onClick={() => {
                      setIsRegisterMode(false);
                      setIsForgotPasswordMode(false);
                    }}
                    className="px-10 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-red-700 transition-all duration-300 text-sm uppercase tracking-wide"
                  >
                    Đăng Nhập
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-3">Xin chào!</h2>
                  <p className="text-red-100 mb-8 text-sm">Đăng ký để trải nghiệm mua sắm tuyệt vời</p>
                  <button
                    onClick={() => {
                      setIsRegisterMode(true);
                      setIsForgotPasswordMode(false);
                    }}
                    className="px-10 py-3 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-red-700 transition-all duration-300 text-sm uppercase tracking-wide"
                  >
                    Đăng Ký
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Forms Container */}
          <div className="flex h-full">
            
            {/* Login / Forgot Password Form */}
            <div 
              className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-700 ${
                isRegisterMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              {isForgotPasswordMode ? (
                <div className="max-w-sm mx-auto w-full">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-1">FashionStore</h1>
                    <p className="text-gray-500 text-sm font-medium">
                      {forgotPasswordStep === 1 ? "Khôi phục mật khẩu tài khoản" : "Nhập mã xác nhận & mật khẩu mới"}
                    </p>
                  </div>
                  
                  {forgotPasswordStep === 1 ? (
                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div>
                        <input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          placeholder="Nhập email đã đăng ký"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all duration-300 uppercase tracking-wide text-sm ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            Đang xử lý...
                          </span>
                        ) : (
                          'Gửi Yêu Cầu'
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-600">
                        Mã xác thực đã được gửi về email <strong>{forgotPasswordEmail}</strong>. Vui lòng kiểm tra hộp thư.
                      </div>
                      <div>
                        <input
                          type="text"
                          maxLength="6"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-center tracking-widest text-lg font-bold"
                          placeholder="Mã OTP 6 số"
                          required
                        />
                      </div>

                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-12"
                          placeholder="Mật khẩu mới"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>

                      <div>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                          placeholder="Xác nhận mật khẩu mới"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all duration-300 uppercase tracking-wide text-sm ${
                          loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={20} className="animate-spin" />
                            Đang đặt lại...
                          </span>
                        ) : (
                          'Đặt lại mật khẩu'
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setForgotPasswordStep(1)}
                        className="w-full text-center text-xs text-gray-500 hover:underline font-semibold transition mt-2"
                      >
                        Quay lại nhập Email
                      </button>
                    </form>
                  )}

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordMode(false);
                        setForgotPasswordStep(1);
                        setForgotPasswordEmail('');
                        setOtpCode('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                      }}
                      className="text-sm text-gray-500 hover:text-red-600 transition font-medium"
                    >
                      ← Quay lại đăng nhập
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-sm mx-auto w-full">
                  {/* Logo for login */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-1">FashionStore</h1>
                    <p className="text-gray-500 text-sm">Đăng nhập để tiếp tục</p>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <input
                        type="text"
                        name="tenDangNhap"
                        value={loginForm.tenDangNhap}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                        placeholder="Tên đăng nhập"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="matKhau"
                        value={loginForm.matKhau}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-12"
                        placeholder="Mật khẩu"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsForgotPasswordMode(true)}
                        className="text-xs text-red-500 hover:underline font-semibold transition"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all duration-300 uppercase tracking-wide text-sm ${
                        loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:-translate-y-0.5'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={20} className="animate-spin" />
                          Đang xử lý...
                        </span>
                      ) : (
                        'Đăng Nhập'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-gray-500 hover:text-red-600 transition">
                      ← Quay về trang chủ
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Register Form */}
            <div 
              className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-700 ${
                isRegisterMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="max-w-sm mx-auto w-full">
                {/* Logo for register */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-red-600 mb-1">FashionStore</h1>
                  <p className="text-gray-500 text-sm">Tạo tài khoản mới</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="hoTen"
                      value={registerForm.hoTen}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Họ và tên"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      name="tenDangNhap"
                      value={registerForm.tenDangNhap}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Tên đăng nhập"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      name="soDienThoai"
                      value={registerForm.soDienThoai}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                      placeholder="Số điện thoại"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="matKhau"
                      value={registerForm.matKhau}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition pr-12"
                      placeholder="Mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-all duration-300 uppercase tracking-wide text-sm ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        Đang xử lý...
                      </span>
                    ) : (
                      'Đăng Ký'
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/" className="text-sm text-gray-500 hover:text-red-600 transition">
                    ← Quay về trang chủ
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;