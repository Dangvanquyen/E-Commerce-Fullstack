import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    X,
    Loader2,
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Package,
    CheckCircle,
    Truck,
    XCircle,
    Clock,
    Check
} from 'lucide-react';
import adminOrderApi from '../../api/adminOrderApi';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const response = await adminOrderApi.getById(id);
            if (response.success) {
                setOrder(response.data);
                setSelectedStatus(response.data.trangThai);
            } else {
                toast.error('Không tìm thấy đơn hàng');
                navigate('/admin/orders');
            }
        } catch (error) {
            toast.error('Không thể tải thông tin đơn hàng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (selectedStatus === order.trangThai) {
            toast.info('Trạng thái không thay đổi');
            return;
        }

        try {
            setUpdating(true);
            const response = await adminOrderApi.updateStatus(id, selectedStatus);
            if (response.success) {
                toast.success('Cập nhật trạng thái thành công');
                navigate('/admin/orders');
            }
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        } finally {
            setUpdating(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusOptions = [
        { value: 'ChoXuLy', label: 'Chờ xử lý' },
        { value: 'DaXacNhan', label: 'Đã xác nhận' }, // Note: This status may need to be added to backend logic
        { value: 'DangGiao', label: 'Đang giao' },
        { value: 'HoanThanh', label: 'Hoàn thành' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={40} className="animate-spin text-red-600" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{order.donHangId}</h2>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Thông tin khách hàng */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Họ tên *</label>
                        <input
                            type="text"
                            value={order.tenNguoiDung || ''}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Địa chỉ giao hàng</label>
                        <textarea
                            value={order.diaChiGiaoHang || ''}
                            disabled
                            rows={2}
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Ngày đặt</label>
                        <input
                            type="text"
                            value={formatDate(order.ngayDat)}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Sản phẩm */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Sản phẩm ({order.chiTiets?.length || 0})</label>
                        <div className="border rounded-lg p-4 bg-gray-50 space-y-3 max-h-60 overflow-y-auto">
                            {order.chiTiets?.map((item) => (
                                <div key={item.donHangChiTietId} className="flex gap-3 bg-white p-3 rounded-lg">
                                    <img
                                        src={item.hinhAnh || 'https://placehold.co/60x60?text=No+Image'}
                                        alt={item.tenSanPham}
                                        className="w-16 h-16 object-cover rounded"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60?text=Error'; }}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.tenSanPham}</p>
                                        <p className="text-xs text-gray-500">
                                          {[
                                            item.mauSac && item.mauSac.trim() && item.mauSac !== 'Mặc định' ? item.mauSac : null,
                                            item.size && item.size.trim() && item.size !== 'Mặc định' ? item.size : null,
                                            `x${item.soLuong}`
                                          ].filter(Boolean).join(' • ')}
                                        </p>
                                    </div>
                                    <p className="font-bold text-sm">{formatPrice(item.donGia * item.soLuong)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Tổng tiền</label>
                        <input
                            type="text"
                            value={formatPrice(order.tongTien)}
                            disabled
                            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-red-600 font-bold cursor-not-allowed"
                        />
                    </div>

                    {/* Trạng thái - Có thể sửa */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Trạng thái</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Thông tin thanh toán */}
                    {order.thanhToan && (
                        <>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">Phương thức thanh toán</label>
                                <input
                                    type="text"
                                    value={order.thanhToan.phuongThuc || ''}
                                    disabled
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </>
                    )}

                    {/* Checkbox hoạt động (giả) */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={order.trangThai !== 'DaHuy'}
                            disabled
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-not-allowed"
                        />
                        <label className="text-gray-700">Hoạt động</label>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="flex-1 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleUpdateStatus}
                        disabled={updating || selectedStatus === order.trangThai}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
