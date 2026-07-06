import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Search,
    Loader2,
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Eye,
    CheckCircle,
    Truck,
    XCircle,
    Clock
} from 'lucide-react';
import adminOrderApi from '../../api/adminOrderApi';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Fetch all orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminOrderApi.getAll();
            if (response.success && response.data) {
                setOrders(response.data || []);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách đơn hàng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Client-side search, filter, and sorting
    const processedOrders = useMemo(() => {
        let result = [...orders];

        // 1. Filter by Status
        if (statusFilter !== 'all') {
            result = result.filter(order => order.trangThai === statusFilter);
        }

        // 2. Filter by Search Query (ID or Customer Name)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(order => 
                order.donHangId.toString().includes(query) ||
                order.tenNguoiDung?.toLowerCase().includes(query)
            );
        }

        // 3. Sort
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.ngayDat) - new Date(a.ngayDat));
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.ngayDat) - new Date(b.ngayDat));
        } else if (sortBy === 'total_desc') {
            result.sort((a, b) => b.tongTien - a.tongTien);
        } else if (sortBy === 'total_asc') {
            result.sort((a, b) => a.tongTien - b.tongTien);
        }

        return result;
    }, [orders, statusFilter, searchQuery, sortBy]);

    // Calculate pagination based on processedOrders
    const totalCount = processedOrders.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return processedOrders.slice(startIndex, startIndex + pageSize);
    }, [processedOrders, currentPage, pageSize]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery, sortBy]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
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

    const statusConfig = {
        'ChoXuLy': { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        'DangGiao': { label: 'Đang giao', color: 'bg-blue-100 text-blue-800', icon: Truck },
        'HoanThanh': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        'DaHuy': { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'ChoXuLy', label: 'Chờ duyệt' },
        { value: 'DangGiao', label: 'Đang giao' },
        { value: 'HoanThanh', label: 'Hoàn thành' },
        { value: 'DaHuy', label: 'Đã hủy' }
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <p className="text-gray-500">Hiển thị {processedOrders.length} trên tổng số {orders.length} đơn hàng</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Row 1: Search & Sort */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        {/* Sort Select */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Sắp xếp:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="total_desc">Tổng tiền (Cao - Thấp)</option>
                                <option value="total_asc">Tổng tiền (Thấp - Cao)</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Status Tabs */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        {statusOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setStatusFilter(option.value);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-1.5 rounded-lg font-medium text-sm transition
                                    ${statusFilter === option.value
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {option.label}
                            </button>
                        ))}
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
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {paginatedOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                <ShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
                                                <p>Không tìm thấy đơn hàng nào khớp với bộ lọc</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedOrders.map((order) => {
                                            const status = statusConfig[order.trangThai] || statusConfig['ChoXuLy'];
                                            const StatusIcon = status.icon;

                                            return (
                                                <tr key={order.donHangId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="font-medium text-red-600">#{order.donHangId}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                                                {order.tenNguoiDung?.charAt(0) || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-800">{order.tenNguoiDung || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                                        {formatDate(order.ngayDat)}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {formatPrice(order.tongTien)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                            <StatusIcon size={14} />
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                to={`/admin/orders/${order.donHangId}`}
                                                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                                                            >
                                                                Xem chi tiết
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <p className="text-sm text-gray-500">
                                    Trang {currentPage} / {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
