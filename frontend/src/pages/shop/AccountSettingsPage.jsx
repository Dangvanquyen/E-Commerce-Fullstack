import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    User,
    Package,
    Settings,
    LogOut,
    Save,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Lock,
    Headphones,
    Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import authApi from '../../api/authApi';
const presetAvatars = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sara',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo'
];

const AccountSettingsPage = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side validations
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận ảnh định dạng JPG, PNG, GIF hoặc WEBP');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Dung lượng ảnh tối đa là 5MB');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setUploading(true);
            const response = await axiosClient.post('/NguoiDung/upload-avatar', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.success) {
                setFormData(prev => ({ ...prev, avatar: response.data }));
                toast.success('Tải ảnh lên thành công');
            } else {
                toast.error(response.message || 'Không thể tải ảnh lên');
            }
        } catch (error) {
            toast.error(error.message || 'Lỗi khi tải ảnh lên');
        } finally {
            setUploading(false);
            // Reset input value to allow selecting same file again
            e.target.value = '';
        }
    };

    const [formData, setFormData] = useState({
        hoTen: user?.hoTen || '',
        email: user?.email || '',
        soDienThoai: user?.soDienThoai || '',
        diaChi: user?.diaChi || '',
        avatar: user?.avatar || ''
    });

    const [passwordForm, setPasswordForm] = useState({
        matKhauCu: '',
        matKhauMoi: '',
        xacNhanMatKhau: ''
    });

    const [errors, setErrors] = useState({});

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
    };

    const validateInfo = () => {
        const newErrors = {};
        if (!formData.hoTen.trim()) {
            newErrors.hoTen = 'Vui lòng nhập họ tên';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (formData.soDienThoai && !/^[0-9]{10,11}$/.test(formData.soDienThoai)) {
            newErrors.soDienThoai = 'Số điện thoại không hợp lệ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();

        if (!validateInfo()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setSaving(true);

            // Gọi API cập nhật thông tin
            const response = await axiosClient.put(`/NguoiDung/${user.nguoiDungId}`, formData);

            if (response.success) {
                // Cập nhật user trong context
                updateUser(response.data);
                toast.success('Cập nhật thông tin thành công');
            }
        } catch (error) {
            toast.error(error.message || 'Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!passwordForm.matKhauCu || !passwordForm.matKhauMoi || !passwordForm.xacNhanMatKhau) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (passwordForm.matKhauMoi.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (passwordForm.matKhauMoi !== passwordForm.xacNhanMatKhau) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            setSaving(true);
            const response = await authApi.changePassword({
                currentPassword: passwordForm.matKhauCu,
                newPassword: passwordForm.matKhauMoi,
                confirmPassword: passwordForm.xacNhanMatKhau
            });

            if (response.success) {
                toast.success('Đổi mật khẩu thành công');
                setPasswordForm({
                    matKhauCu: '',
                    matKhauMoi: '',
                    xacNhanMatKhau: ''
                });
            } else {
                toast.error(response.message || 'Không thể đổi mật khẩu');
            }
        } catch (error) {
            toast.error(error.message || 'Không thể đổi mật khẩu');
        } finally {
            setSaving(false);
        }
    };

    // Redirect if not authenticated
    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                        {/* User info */}
                        <div className="text-center mb-6">
                            {user?.avatar ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.hoTen} 
                                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-red-500 shadow-sm"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=Avatar'; }}
                                />
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User size={40} className="text-white" />
                                </div>
                            )}
                            <h2 className="font-bold text-lg">{user?.hoTen || 'Người dùng'}</h2>
                            <p className="text-gray-500 text-sm">{user?.email || user?.tenDangNhap}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {user?.vaiTro?.tenVaiTro || user?.vaiTro || 'Khách hàng'}
                            </span>
                        </div>

                        <hr className="my-4" />

                        {/* Menu */}
                        <nav className="space-y-2">
                            <Link
                                to="/profile"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                            >
                                <Package size={20} />
                                Đơn hàng của tôi
                            </Link>

                            <Link
                                to="/profile/settings"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 font-medium"
                            >
                                <Settings size={20} />
                                Thông tin tài khoản
                            </Link>

                            <Link
                                to="/cham-soc-khach-hang"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                            >
                                <Headphones size={20} />
                                Chăm sóc khách hàng
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                            >
                                <LogOut size={20} />
                                Đăng xuất
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main content */}
                <div className="lg:col-span-3">
                    <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-4 py-2 rounded-lg font-medium transition
                ${activeTab === 'info'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Thông tin cá nhân
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`px-4 py-2 rounded-lg font-medium transition
                ${activeTab === 'password'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            Đổi mật khẩu
                        </button>
                    </div>

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <form onSubmit={handleSaveInfo}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Chọn Avatar */}
                                    <div className="md:col-span-2 border-b pb-6 mb-4">
                                        <label className="block text-gray-700 font-medium mb-3">
                                            Ảnh đại diện
                                        </label>
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            {/* Preview */}
                                            <div className="relative group shrink-0">
                                                {formData.avatar ? (
                                                    <img 
                                                        src={formData.avatar} 
                                                        alt="Avatar preview" 
                                                        className="w-24 h-24 rounded-full object-cover border-4 border-red-100 shadow bg-gray-50"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=Error'; }}
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-red-100 shadow">
                                                        <User size={48} className="text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Preset avatars selection */}
                                            <div className="flex-1 w-full">
                                                {/* Upload File Input */}
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-500 mb-2">Tải ảnh từ máy tính:</p>
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition text-sm font-medium text-gray-700 active:scale-95">
                                                            <Upload size={16} />
                                                            Chọn ảnh từ máy
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                                className="hidden"
                                                                disabled={uploading}
                                                            />
                                                        </label>
                                                        {uploading && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <Loader2 size={16} className="animate-spin text-red-500" />
                                                                Đang tải lên...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-500 mb-2">Hoặc chọn ảnh đại diện có sẵn:</p>
                                                <div className="flex flex-wrap gap-3 mb-4">
                                                    {presetAvatars.map((url, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, avatar: url }))}
                                                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition transform hover:scale-105 active:scale-95 bg-white ${
                                                                formData.avatar === url ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover bg-gray-50" />
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Custom URL Input */}
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Hoặc nhập liên kết hình ảnh tùy chỉnh (tối đa 500 ký tự):</p>
                                                    <input
                                                        type="url"
                                                        name="avatar"
                                                        value={formData.avatar}
                                                        onChange={handleChange}
                                                        maxLength={500}
                                                        className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                        placeholder="https://example.com/my-avatar.jpg"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tên đăng nhập - readonly */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            <User size={16} className="inline mr-2" />
                                            Tên đăng nhập
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.tenDangNhap || ''}
                                            disabled
                                            className="w-full px-4 py-2 bg-gray-100 border rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Không thể thay đổi</p>
                                    </div>

                                    {/* Họ tên */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Họ và tên *
                                        </label>
                                        <input
                                            type="text"
                                            name="hoTen"
                                            value={formData.hoTen}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                        ${errors.hoTen ? 'border-red-500' : ''}`}
                                            placeholder="Nguyễn Văn A"
                                        />
                                        {errors.hoTen && (
                                            <p className="text-red-500 text-sm mt-1">{errors.hoTen}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            <Mail size={16} className="inline mr-2" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                        ${errors.email ? 'border-red-500' : ''}`}
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Số điện thoại */}
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            <Phone size={16} className="inline mr-2" />
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="soDienThoai"
                                            value={formData.soDienThoai}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                        ${errors.soDienThoai ? 'border-red-500' : ''}`}
                                            placeholder="0901234567"
                                        />
                                        {errors.soDienThoai && (
                                            <p className="text-red-500 text-sm mt-1">{errors.soDienThoai}</p>
                                        )}
                                    </div>

                                    {/* Địa chỉ */}
                                    <div className="md:col-span-2">
                                        <label className="block text-gray-700 font-medium mb-2">
                                            <MapPin size={16} className="inline mr-2" />
                                            Địa chỉ
                                        </label>
                                        <textarea
                                            name="diaChi"
                                            value={formData.diaChi}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Password Tab */}
                    {activeTab === 'password' && (
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <form onSubmit={handleChangePassword}>
                                <div className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            <Lock size={16} className="inline mr-2" />
                                            Mật khẩu hiện tại
                                        </label>
                                        <input
                                            type="password"
                                            name="matKhauCu"
                                            value={passwordForm.matKhauCu}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Nhập mật khẩu hiện tại"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            name="matKhauMoi"
                                            value={passwordForm.matKhauMoi}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Ít nhất 6 ký tự"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-medium mb-2">
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            name="xacNhanMatKhau"
                                            value={passwordForm.xacNhanMatKhau}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Lock size={18} />
                                            )}
                                            Đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Account Info Card */}
                    <div className="mt-6 bg-gray-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Thông tin tài khoản</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Mã người dùng</p>
                                <p className="font-medium">#{user?.nguoiDungId}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Ngày tạo</p>
                                <p className="font-medium">
                                    {user?.ngayTao ? new Date(user.ngayTao).toLocaleDateString('vi-VN') : '-'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Vai trò</p>
                                <p className="font-medium">{user?.vaiTro?.tenVaiTro || user?.vaiTro || 'Khách hàng'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Trạng thái</p>
                                <p className="font-medium text-green-600">Hoạt động</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountSettingsPage;
