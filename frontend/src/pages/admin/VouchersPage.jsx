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
    Ticket,
    Calendar,
    Percent,
    DollarSign,
    AlertCircle,
    Info
} from 'lucide-react';
import voucherApi from '../../api/voucherApi';

const VouchersPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingVoucher, setEditingVoucher] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        moTa: '',
        loaiGiamGia: 'PhanTram',
        giaTri: '',
        giaTriGiamToiDa: '',
        donHangToiThieu: 0,
        ngayBatDau: '',
        ngayKetThuc: '',
        soLuong: '',
        trangThai: true
    });
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleteId, setDeleteId] = useState(null);

    // Helper to format ISO dates to HTML datetime-local format
    const toDatetimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Fetch vouchers
    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const response = await voucherApi.getAll();
            if (response.success) {
                setVouchers(response.data || []);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách mã giảm giá');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    // Helper to format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Helper to format standard date representation
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Helper to get status object containing text and style class
    const getVoucherStatus = (voucher) => {
        if (!voucher.trangThai) {
            return { text: 'Vô hiệu hóa', className: 'bg-gray-100 text-gray-700 border border-gray-200' };
        }
        const now = new Date();
        const start = new Date(voucher.ngayBatDau);
        const end = new Date(voucher.ngayKetThuc);

        if (now < start) {
            return { text: 'Chưa diễn ra', className: 'bg-blue-50 text-blue-700 border border-blue-200' };
        }
        if (now > end) {
            return { text: 'Hết hạn', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
        }
        if (voucher.soLuongDaDung >= voucher.soLuong) {
            return { text: 'Hết lượt dùng', className: 'bg-red-50 text-red-700 border border-red-200' };
        }
        return { text: 'Đang hoạt động', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    };

    // Filtered vouchers list based on filters and search queries
    const filteredVouchers = useMemo(() => {
        return vouchers.filter(voucher => {
            const matchesSearch = !searchQuery.trim() || 
                voucher.code?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                voucher.moTa?.toLowerCase().includes(searchQuery.trim().toLowerCase());

            const matchesType = typeFilter === 'all' || voucher.loaiGiamGia === typeFilter;

            const statusObj = getVoucherStatus(voucher);
            let matchesStatus = true;
            if (statusFilter !== 'all') {
                if (statusFilter === 'active') {
                    matchesStatus = statusObj.text === 'Đang hoạt động';
                } else if (statusFilter === 'expired') {
                    matchesStatus = statusObj.text === 'Hết hạn';
                } else if (statusFilter === 'inactive') {
                    matchesStatus = statusObj.text === 'Vô hiệu hóa';
                } else if (statusFilter === 'scheduled') {
                    matchesStatus = statusObj.text === 'Chưa diễn ra';
                } else if (statusFilter === 'soldout') {
                    matchesStatus = statusObj.text === 'Hết lượt dùng';
                }
            }

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [vouchers, searchQuery, typeFilter, statusFilter]);

    // Open modal for adding a new voucher
    const handleAddNew = () => {
        setEditingVoucher(null);
        // Default start date is now, end date is one week from now
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);

        setFormData({
            code: '',
            moTa: '',
            loaiGiamGia: 'PhanTram',
            giaTri: '',
            giaTriGiamToiDa: '',
            donHangToiThieu: 0,
            ngayBatDau: toDatetimeLocal(now),
            ngayKetThuc: toDatetimeLocal(nextWeek),
            soLuong: '',
            trangThai: true
        });
        setShowModal(true);
    };

    // Open modal for editing a voucher
    const handleEdit = (voucher) => {
        setEditingVoucher(voucher);
        setFormData({
            code: voucher.code || '',
            moTa: voucher.moTa || '',
            loaiGiamGia: voucher.loaiGiamGia || 'PhanTram',
            giaTri: voucher.giaTri || '',
            giaTriGiamToiDa: voucher.giaTriGiamToiDa || '',
            donHangToiThieu: voucher.donHangToiThieu || 0,
            ngayBatDau: toDatetimeLocal(voucher.ngayBatDau),
            ngayKetThuc: toDatetimeLocal(voucher.ngayKetThuc),
            soLuong: voucher.soLuong || '',
            trangThai: voucher.trangThai ?? true
        });
        setShowModal(true);
    };

    // Form submission handler
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Standard validation checks
        if (!formData.code.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }
        if (/\s/.test(formData.code)) {
            toast.error('Mã giảm giá không được chứa khoảng trắng');
            return;
        }
        if (!formData.giaTri || Number(formData.giaTri) <= 0) {
            toast.error('Giá trị giảm phải lớn hơn 0');
            return;
        }
        if (formData.loaiGiamGia === 'PhanTram' && Number(formData.giaTri) > 100) {
            toast.error('Giá trị giảm theo phần trăm không được vượt quá 100%');
            return;
        }
        if (formData.loaiGiamGia === 'PhanTram' && formData.giaTriGiamToiDa && Number(formData.giaTriGiamToiDa) <= 0) {
            toast.error('Giá trị giảm tối đa phải lớn hơn 0');
            return;
        }
        if (Number(formData.donHangToiThieu) < 0) {
            toast.error('Đơn hàng tối thiểu không được âm');
            return;
        }
        if (!formData.soLuong || Number(formData.soLuong) <= 0) {
            toast.error('Số lượng mã phát hành phải lớn hơn hoặc bằng 1');
            return;
        }
        if (!formData.ngayBatDau || !formData.ngayKetThuc) {
            toast.error('Vui lòng chọn thời gian hiệu lực');
            return;
        }

        const start = new Date(formData.ngayBatDau);
        const end = new Date(formData.ngayKetThuc);
        if (end <= start) {
            toast.error('Ngày kết thúc phải diễn ra sau ngày bắt đầu');
            return;
        }

        const payload = {
            ...formData,
            code: formData.code.trim().toUpperCase(),
            giaTri: Number(formData.giaTri),
            giaTriGiamToiDa: formData.giaTriGiamToiDa ? Number(formData.giaTriGiamToiDa) : null,
            donHangToiThieu: Number(formData.donHangToiThieu),
            soLuong: parseInt(formData.soLuong),
            ngayBatDau: new Date(formData.ngayBatDau).toISOString(),
            ngayKetThuc: new Date(formData.ngayKetThuc).toISOString()
        };

        try {
            setSaving(true);
            let response;
            if (editingVoucher) {
                response = await voucherApi.update(editingVoucher.maGiamGiaId, payload);
                if (response.success) {
                    toast.success('Cập nhật mã giảm giá thành công');
                    setShowModal(false);
                    fetchVouchers();
                }
            } else {
                response = await voucherApi.create(payload);
                if (response.success) {
                    toast.success('Thêm mã giảm giá thành công');
                    setShowModal(false);
                    fetchVouchers();
                }
            }
        } catch (error) {
            // Handle error utilizing error message mapped by Axios client interceptor
            const message = error.message || 'Có lỗi xảy ra khi lưu mã giảm giá';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // Toggle active status API call
    const handleToggleStatus = async (voucher) => {
        try {
            const newStatus = !voucher.trangThai;
            const response = await voucherApi.updateStatus(voucher.maGiamGiaId, newStatus);
            if (response.success) {
                toast.success(`Đã ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá`);
                fetchVouchers();
            }
        } catch (error) {
            toast.error(error.message || 'Không thể cập nhật trạng thái');
        }
    };

    // Delete confirmation handler
    const handleDelete = async (id) => {
        try {
            const response = await voucherApi.delete(id);
            if (response.success) {
                toast.success('Xóa mã giảm giá thành công');
                setDeleteId(null);
                fetchVouchers();
            }
        } catch (error) {
            toast.error(error.message || 'Không thể xóa mã giảm giá');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section with page title & actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Ticket className="text-red-500" size={28} />
                        Quản lý Mã giảm giá (Vouchers)
                    </h1>
                    <p className="text-gray-500">Tạo, cập nhật và quản lý các chương trình khuyến mãi mã giảm giá</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                >
                    <Plus size={20} />
                    Tạo mã giảm giá mới
                </button>
            </div>

            {/* Filter controls section */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search query input */}
                    <div className="flex-1 relative w-full">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo mã code, mô tả..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Filter selectors */}
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Loại:</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="all">Tất cả loại</option>
                                <option value="PhanTram">Giảm phần trăm (%)</option>
                                <option value="SoTien">Giảm tiền mặt (đ)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="scheduled">Chưa diễn ra</option>
                                <option value="expired">Hết hạn</option>
                                <option value="soldout">Hết lượt dùng</option>
                                <option value="inactive">Bị vô hiệu hóa</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vouchers lists table representation */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={40} className="animate-spin text-red-600" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã Code</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mức giảm</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá trị đơn tối thiểu</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời hạn sử dụng</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[150px]">Lượt dùng (Đã dùng/Tổng)</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredVouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                                            <Ticket size={48} className="mx-auto mb-4 text-gray-300 stroke-[1.5]" />
                                            <p className="font-medium text-gray-600">Không tìm thấy mã giảm giá nào</p>
                                            <p className="text-xs text-gray-400 mt-1">Vui lòng điều chỉnh bộ lọc hoặc tạo mã mới.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVouchers.map((voucher) => {
                                        const status = getVoucherStatus(voucher);
                                        const percentUsed = Math.min(100, Math.round((voucher.soLuongDaDung / voucher.soLuong) * 100));
                                        
                                        return (
                                            <tr key={voucher.maGiamGiaId} className="hover:bg-gray-50/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 tracking-wide font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-sm inline-block border border-slate-200">
                                                        {voucher.code}
                                                    </div>
                                                    {voucher.moTa && (
                                                        <p className="text-xs text-gray-500 mt-1.5 max-w-[200px] truncate" title={voucher.moTa}>
                                                            {voucher.moTa}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        {voucher.loaiGiamGia === 'PhanTram' ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-red-600 text-sm flex items-center gap-0.5">
                                                                    {voucher.giaTri}% <Percent size={14} className="stroke-[2]" />
                                                                </span>
                                                                {voucher.giaTriGiamToiDa && (
                                                                    <span className="text-[10px] text-gray-400">
                                                                        Tối đa: {formatPrice(voucher.giaTriGiamToiDa)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="font-semibold text-red-600 text-sm flex items-center gap-0.5">
                                                                -{formatPrice(voucher.giaTri)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                    {voucher.donHangToiThieu > 0 ? formatPrice(voucher.donHangToiThieu) : 'Không giới hạn'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col text-xs text-gray-600 gap-1">
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Bắt đầu: {formatDate(voucher.ngayBatDau)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                            Kết thúc: {formatDate(voucher.ngayKetThuc)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1.5">
                                                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                                                            <span>{voucher.soLuongDaDung} / {voucher.soLuong}</span>
                                                            <span>{percentUsed}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    percentUsed >= 90 ? 'bg-red-500' : percentUsed >= 70 ? 'bg-amber-500' : 'bg-red-600'
                                                                }`} 
                                                                style={{ width: `${percentUsed}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleToggleStatus(voucher)}
                                                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${status.className}`}
                                                        title="Click để bật/tắt nhanh kích hoạt mã"
                                                    >
                                                        {status.text}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleEdit(voucher)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Sửa mã giảm giá"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(voucher.maGiamGiaId)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Xóa mã giảm giá"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Creation & Modification modal form */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => !saving && setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto z-10 animate-fadeIn">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Ticket size={24} className="text-red-600" />
                                {editingVoucher ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}
                            </h2>
                            <button 
                                onClick={() => !saving && setShowModal(false)} 
                                className="text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-100 rounded-lg"
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">Mã Voucher *</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        disabled={!!editingVoucher}
                                        placeholder="Ví dụ: WINTER50K"
                                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono uppercase tracking-wider text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Mã viết liền không dấu, không khoảng trắng.</p>
                                </div>

                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">Loại giảm giá *</label>
                                    <select
                                        value={formData.loaiGiamGia}
                                        onChange={(e) => setFormData({ ...formData, loaiGiamGia: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                                        required
                                    >
                                        <option value="PhanTram">Giảm theo Phần trăm (%)</option>
                                        <option value="SoTien">Giảm theo Số tiền cố định (đ)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold text-sm mb-1.5">Mô tả chương trình</label>
                                <input
                                    type="text"
                                    value={formData.moTa}
                                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                    placeholder="Ví dụ: Giảm 10% tối đa 50k cho đơn từ 200k"
                                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">
                                        Mức giảm giá * ({formData.loaiGiamGia === 'PhanTram' ? '%' : 'đ'})
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {formData.loaiGiamGia === 'PhanTram' ? (
                                                <Percent size={16} className="text-gray-400" />
                                            ) : (
                                                <span className="text-gray-400 text-sm font-semibold">₫</span>
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.giaTri}
                                            onChange={(e) => setFormData({ ...formData, giaTri: e.target.value })}
                                            placeholder={formData.loaiGiamGia === 'PhanTram' ? '10' : '50000'}
                                            min="0.01"
                                            step="any"
                                            className="w-full pl-8 pr-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">Số lượng phát hành *</label>
                                    <input
                                        type="number"
                                        value={formData.soLuong}
                                        onChange={(e) => setFormData({ ...formData, soLuong: e.target.value })}
                                        placeholder="100"
                                        min="1"
                                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">Đơn tối thiểu áp dụng</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm font-semibold">₫</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.donHangToiThieu}
                                            onChange={(e) => setFormData({ ...formData, donHangToiThieu: e.target.value })}
                                            placeholder="150000"
                                            min="0"
                                            className="w-full pl-8 pr-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5 flex items-center gap-1">
                                        Giảm tối đa
                                        <span className="group relative text-gray-400 cursor-pointer">
                                            <Info size={14} />
                                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded p-2 w-48 shadow-lg leading-normal z-50">
                                                Số tiền tối đa có thể được giảm. Chỉ áp dụng cho loại giảm giá phần trăm.
                                            </span>
                                        </span>
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 text-sm font-semibold">₫</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={formData.giaTriGiamToiDa}
                                            onChange={(e) => setFormData({ ...formData, giaTriGiamToiDa: e.target.value })}
                                            placeholder="Không giới hạn"
                                            disabled={formData.loaiGiamGia === 'SoTien'}
                                            min="0"
                                            className="w-full pl-8 pr-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">Ngày bắt đầu *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.ngayBatDau}
                                        onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold text-sm mb-1.5">Ngày kết thúc *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.ngayKetThuc}
                                        onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                                        className="w-full px-3.5 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="trangThai"
                                    checked={formData.trangThai}
                                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <label htmlFor="trangThai" className="text-gray-700 font-semibold text-sm cursor-pointer select-none">
                                    Kích hoạt ngay (Trạng thái hoạt động)
                                </label>
                            </div>

                            <div className="flex gap-3 mt-6 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm disabled:bg-gray-400 shadow-lg shadow-red-100"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    {editingVoucher ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center z-10 animate-fadeIn">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <Trash2 size={28} className="stroke-[2]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Xác nhận xóa Voucher</h3>
                        <p className="text-sm text-gray-500 mb-6 leading-normal">
                            Bạn có chắc muốn xóa mã giảm giá này? <br />
                            Hành động này sẽ xóa vĩnh viễn dữ liệu khỏi hệ thống.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition text-sm shadow-lg shadow-red-100"
                            >
                                Đồng ý xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VouchersPage;
