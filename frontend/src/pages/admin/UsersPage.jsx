import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Loader2,
    X,
    Check,
    Users,
    UserPlus,
    Shield,
    Eye,
    EyeOff
} from 'lucide-react';
import userApi from '../../api/userApi';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        soDienThoai: '',
        tenDangNhap: '',
        matKhau: '',
        vaiTroId: 2, // Default: Customer
        trangThai: true
    });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Delete confirmation
    const [deleteId, setDeleteId] = useState(null);

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();
            if (response.success) {
                setUsers(response.data || []);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách người dùng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users by search, role and status
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = !searchQuery.trim() || 
                user.hoTen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.tenDangNhap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase());
                
            const matchesRole = roleFilter === 'all' || 
                (roleFilter === 'Admin' && user.vaiTroTen === 'Admin') ||
                (roleFilter === 'Customer' && user.vaiTroTen !== 'Admin');
                
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && user.trangThai) ||
                (statusFilter === 'locked' && !user.trangThai);
                
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchQuery, roleFilter, statusFilter]);

    // Open modal for new user
    const handleAddNew = () => {
        setEditingUser(null);
        setFormData({
            hoTen: '',
            email: '',
            soDienThoai: '',
            tenDangNhap: '',
            matKhau: '',
            vaiTroId: 2,
            trangThai: true
        });
        setShowModal(true);
    };

    // Open modal for edit
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            hoTen: user.hoTen || '',
            email: user.email || '',
            soDienThoai: user.soDienThoai || '',
            tenDangNhap: user.tenDangNhap || '',
            matKhau: '',
            vaiTroId: user.vaiTroTen === 'Admin' ? 1 : 2,
            trangThai: user.trangThai ?? true
        });
        setShowModal(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.hoTen.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return;
        }

        try {
            setSaving(true);

            if (editingUser) {
                // Update
                const updateData = {
                    hoTen: formData.hoTen,
                    email: formData.email,
                    soDienThoai: formData.soDienThoai,
                    diaChi: editingUser.diaChi || '',
                    trangThai: formData.trangThai,
                    vaiTroId: formData.vaiTroId,
                    // API update yêu cầu đầy đủ model, giữ nguyên username hiện tại
                    tenDangNhap: editingUser.tenDangNhap || ''
                };
                const response = await userApi.update(editingUser.nguoiDungId, updateData);
                if (response.success) {
                    toast.success('Cập nhật người dùng thành công');
                    setShowModal(false);
                    fetchUsers();
                }
            } else {
                // Create new user
                if (!formData.tenDangNhap || !formData.matKhau) {
                    toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
                    setSaving(false);
                    return;
                }
                const createData = {
                    hoTen: formData.hoTen,
                    email: formData.email,
                    soDienThoai: formData.soDienThoai,
                    tenDangNhap: formData.tenDangNhap,
                    matKhau: formData.matKhau,
                    vaiTroId: formData.vaiTroId
                };
                const response = await userApi.create(createData);
                if (response.success || response.token) {
                    toast.success('Thêm người dùng thành công');
                    setShowModal(false);
                    fetchUsers();
                }
            }
        } catch (error) {
            const message = error.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // Delete user
    const handleDelete = async (id) => {
        try {
            const response = await userApi.delete(id);
            if (response.success) {
                toast.success('Xóa người dùng thành công');
                setDeleteId(null);
                fetchUsers();
            }
        } catch (error) {
            toast.error('Không thể xóa người dùng');
        }
    };

    // Toggle status
    const handleToggleStatus = async (user) => {
        try {
            const response = await userApi.updateStatus(user.nguoiDungId, !user.trangThai);
            if (response.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchUsers();
            }
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h1>
                    <p className="text-gray-500">Hiển thị {filteredUsers.length} trên tổng số {users.length} người dùng</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    Thêm người dùng
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="flex-1 relative w-full">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo tên, email, username..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        {/* Role filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Vai trò:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="all">Tất cả</option>
                                <option value="Admin">Admin</option>
                                <option value="Customer">Khách hàng</option>
                            </select>
                        </div>

                        {/* Status filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Hoạt động</option>
                                <option value="locked">Bị khóa</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-red-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tên đăng nhập</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email / SĐT</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                            <p>Không tìm thấy người dùng nào khớp với bộ lọc</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.nguoiDungId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-500">#{user.nguoiDungId}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {user.hoTen?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-800">{user.hoTen}</p>
                                                        <p className="text-xs text-gray-500">Tạo: {formatDate(user.ngayTao)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{user.tenDangNhap}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600">{user.email || '-'}</p>
                                                <p className="text-sm text-gray-400">{user.soDienThoai || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                          ${user.vaiTroTen === 'Admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'}`}>
                                                    <Shield size={12} />
                                                    {user.vaiTroTen || 'Customer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition
                            ${user.trangThai
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {user.trangThai ? 'Hoạt động' : 'Bị khóa'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(user.nguoiDungId)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Họ tên *</label>
                                    <input
                                        type="text"
                                        value={formData.hoTen}
                                        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>

                                {!editingUser && (
                                    <>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1">Tên đăng nhập *</label>
                                            <input
                                                type="text"
                                                value={formData.tenDangNhap}
                                                onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                                placeholder="username"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-medium mb-1">Mật khẩu *</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.matKhau}
                                                    onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                                                    placeholder="Nhập mật khẩu"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.soDienThoai}
                                        onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="0901234567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Vai trò</label>
                                    <select
                                        value={formData.vaiTroId}
                                        onChange={(e) => setFormData({ ...formData, vaiTroId: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value={2}>Khách hàng</option>
                                        <option value={1}>Admin</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="trangThai"
                                        checked={formData.trangThai}
                                        onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <label htmlFor="trangThai" className="text-gray-700">Hoạt động</label>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    {editingUser ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm p-6 m-4 text-center">
                        <Trash2 size={48} className="mx-auto text-red-500 mb-4" />
                        <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
                        <p className="text-gray-500 mb-6">Bạn có chắc muốn xóa người dùng này? Hành động không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
