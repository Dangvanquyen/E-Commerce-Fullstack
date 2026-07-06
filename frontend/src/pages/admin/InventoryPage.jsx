import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Search,
    Boxes,
    AlertTriangle,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Plus,
    Minus,
    RefreshCw,
    Edit2,
    Package,
    FolderTree,
    TrendingUp
} from 'lucide-react';
import productVariantApi from '../../api/productVariantApi';
import categoryApi from '../../api/categoryApi';

const InventoryPage = () => {
    const [variants, setVariants] = useState([]);
    const [stats, setStats] = useState({
        totalVariants: 0,
        totalProductsCount: 0,
        lowStockCount: 0,
        outOfStockCount: 0
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockStatus, setStockStatus] = useState('');
    const [sortBy, setSortBy] = useState('name_asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Temporary stock inputs (stores variantId -> editedValue)
    const [stockEdits, setStockEdits] = useState({});
    const [savingIds, setSavingIds] = useState({});

    // Fetch stats
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await productVariantApi.getInventoryStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải thống kê kho hàng:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getAll();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh mục sản phẩm:', error);
        }
    };

    // Fetch variants
    const fetchVariants = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                pageNumber: page,
                pageSize: pageSize,
                searchTerm: searchTerm || undefined,
                danhMucId: selectedCategory || undefined,
                stockStatus: stockStatus || undefined
            };

            const response = await productVariantApi.getPaged(params);
            if (response.success && response.data) {
                const items = response.data.items || [];
                setVariants(items);
                setTotalCount(response.data.totalCount || 0);
                setTotalPages(Math.ceil((response.data.totalCount || 0) / pageSize));

                // Initialize stock edits with current stock levels
                const edits = {};
                items.forEach(v => {
                    edits[v.sanPhamChiTietId] = v.soLuongTon;
                });
                setStockEdits(edits);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách tồn kho');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategory, stockStatus]);

    // Initial load
    useEffect(() => {
        fetchStats();
        fetchCategories();
    }, []);

    // Search and filter triggers (debounced search is ideal but simple effect is fine for reactivity)
    useEffect(() => {
        const handler = setTimeout(() => {
            setCurrentPage(1);
            fetchVariants(1);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, selectedCategory, stockStatus, fetchVariants]);

    // Page change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchVariants(page);
    };

    // Stock change handler (from input or buttons)
    const handleStockChange = (variantId, newValue) => {
        const parsed = parseInt(newValue);
        if (isNaN(parsed) || parsed < 0) return;
        
        setStockEdits(prev => ({
            ...prev,
            [variantId]: parsed
        }));
    };

    const handleIncrement = (variantId) => {
        setStockEdits(prev => {
            const current = prev[variantId] !== undefined ? prev[variantId] : 0;
            return {
                ...prev,
                [variantId]: current + 1
            };
        });
    };

    const handleDecrement = (variantId) => {
        setStockEdits(prev => {
            const current = prev[variantId] !== undefined ? prev[variantId] : 0;
            if (current <= 0) return prev;
            return {
                ...prev,
                [variantId]: current - 1
            };
        });
    };

    // Save stock level update
    const handleSaveStock = async (variantId, originalValue) => {
        const newValue = stockEdits[variantId];
        if (newValue === originalValue) return;

        try {
            setSavingIds(prev => ({ ...prev, [variantId]: true }));
            const response = await productVariantApi.updateInventory(variantId, newValue);
            if (response.success) {
                toast.success('Cập nhật tồn kho thành công!');
                // Update local variant value to avoid show saving actions
                setVariants(prev => prev.map(v => 
                    v.sanPhamChiTietId === variantId ? { ...v, soLuongTon: newValue } : v
                ));
                // Reload stats
                fetchStats();
            } else {
                toast.error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật tồn kho');
            console.error(error);
        } finally {
            setSavingIds(prev => ({ ...prev, [variantId]: false }));
        }
    };

    // Reset edited stock to original
    const handleCancelStock = (variantId, originalValue) => {
        setStockEdits(prev => ({
            ...prev,
            [variantId]: originalValue
        }));
    };

    // Client-side sorting on the paginated items
    const sortedVariants = useMemo(() => {
        const result = [...variants];
        if (sortBy === 'name_asc') {
            result.sort((a, b) => a.tenSanPham.localeCompare(b.tenSanPham));
        } else if (sortBy === 'name_desc') {
            result.sort((a, b) => b.tenSanPham.localeCompare(a.tenSanPham));
        } else if (sortBy === 'stock_asc') {
            result.sort((a, b) => a.soLuongTon - b.soLuongTon);
        } else if (sortBy === 'stock_desc') {
            result.sort((a, b) => b.soLuongTon - a.soLuongTon);
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => a.giaBan - b.giaBan);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.giaBan - a.giaBan);
        }
        return result;
    }, [variants, sortBy]);

    // Format currency Helper
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Render stock status badge
    const renderStatusBadge = (stock) => {
        if (stock === 0) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Hết hàng
                </span>
            );
        }
        if (stock <= 10) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                    Sắp hết ({stock})
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Còn hàng
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Quản lý kho hàng</h2>
                    <p className="text-gray-500 text-sm">Theo dõi, tìm kiếm và điều chỉnh nhanh số lượng tồn kho sản phẩm.</p>
                </div>
                <button
                    onClick={() => { fetchStats(); fetchVariants(currentPage); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border rounded-xl hover:bg-slate-50 transition active:scale-95 shadow-sm"
                >
                    <RefreshCw size={16} className={(loading || statsLoading) ? 'animate-spin' : ''} />
                    Tải lại dữ liệu
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Variants */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng mẫu biến thể</p>
                        {statsLoading ? (
                            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                        ) : (
                            <h3 className="text-2xl font-extrabold text-slate-800">{stats.totalVariants} <span className="text-sm font-normal text-slate-400">SKUs</span></h3>
                        )}
                    </div>
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <Boxes size={24} />
                    </div>
                </div>

                {/* Total Quantity */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tổng sản phẩm tồn</p>
                        {statsLoading ? (
                            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                        ) : (
                            <h3 className="text-2xl font-extrabold text-slate-800">{stats.totalProductsCount} <span className="text-sm font-normal text-slate-400">cái</span></h3>
                        )}
                    </div>
                    <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                        <TrendingUp size={24} />
                    </div>
                </div>

                {/* Low Stock Warning */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sắp hết hàng (≤10)</p>
                        {statsLoading ? (
                            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                        ) : (
                            <h3 className="text-2xl font-extrabold text-yellow-600">{stats.lowStockCount} <span className="text-sm font-normal text-slate-400">mẫu</span></h3>
                        )}
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                {/* Out of Stock */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                    <div className="space-y-2">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Đã hết hàng (0)</p>
                        {statsLoading ? (
                            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                        ) : (
                            <h3 className="text-2xl font-extrabold text-red-600">{stats.outOfStockCount} <span className="text-sm font-normal text-slate-400">mẫu</span></h3>
                        )}
                    </div>
                    <div className="p-3 bg-red-50 rounded-2xl text-red-600">
                        <Package size={24} />
                    </div>
                </div>
            </div>

            {/* Filters and Search Panel */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên sản phẩm, size, màu sắc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition duration-150"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition appearance-none cursor-pointer"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map((cat) => (
                                <option key={cat.danhMucId} value={cat.danhMucId}>
                                    {cat.tenDanhMuc}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                            <FolderTree size={16} />
                        </div>
                    </div>

                    {/* Stock Status Filter */}
                    <div className="relative">
                        <select
                            value={stockStatus}
                            onChange={(e) => setStockStatus(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition appearance-none cursor-pointer"
                        >
                            <option value="">Trạng thái kho</option>
                            <option value="in_stock">Còn hàng (&gt;10)</option>
                            <option value="low_stock">Sắp hết hàng (≤10)</option>
                            <option value="out_of_stock">Hết hàng (0)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                            <AlertTriangle size={16} />
                        </div>
                    </div>

                    {/* Sort By Filter */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition appearance-none cursor-pointer"
                        >
                            <option value="name_asc">Tên sản phẩm A-Z</option>
                            <option value="name_desc">Tên sản phẩm Z-A</option>
                            <option value="stock_desc">Tồn kho giảm dần</option>
                            <option value="stock_asc">Tồn kho tăng dần</option>
                            <option value="price_desc">Giá bán giảm dần</option>
                            <option value="price_asc">Giá bán tăng dần</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                            <Plus size={16} className="rotate-45" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-red-500" size={32} />
                        <span className="text-slate-500 text-sm font-medium">Đang tải dữ liệu kho hàng...</span>
                    </div>
                ) : sortedVariants.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
                            <Boxes size={36} />
                        </div>
                        <h4 className="text-slate-700 font-bold text-lg">Không tìm thấy biến thể nào</h4>
                        <p className="text-slate-400 text-sm mt-1">Vui lòng thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                    <th className="py-4 px-6 w-16">Ảnh</th>
                                    <th className="py-4 px-4">Tên sản phẩm / Mã mẫu</th>
                                    <th className="py-4 px-4">Danh mục</th>
                                    <th className="py-4 px-4 w-28">Kích cỡ</th>
                                    <th className="py-4 px-4 w-28">Màu sắc</th>
                                    <th className="py-4 px-4 text-right">Giá bán</th>
                                    <th className="py-4 px-6 text-center w-64">Số lượng tồn kho</th>
                                    <th className="py-4 px-4 text-center">Trạng thái</th>
                                    <th className="py-4 px-6 text-center w-24">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                {sortedVariants.map((item) => {
                                    const editedValue = stockEdits[item.sanPhamChiTietId];
                                    const isChanged = editedValue !== undefined && editedValue !== item.soLuongTon;
                                    const isSaving = savingIds[item.sanPhamChiTietId];

                                    return (
                                        <tr key={item.sanPhamChiTietId} className="hover:bg-slate-50/50 transition">
                                            {/* Thumbnail */}
                                            <td className="py-4 px-6">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border overflow-hidden flex items-center justify-center shrink-0">
                                                    {item.HinhAnh || item.hinhAnh ? (
                                                        <img
                                                            src={item.HinhAnh || item.hinhAnh}
                                                            alt={item.tenSanPham}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Fashion'; }}
                                                        />
                                                    ) : (
                                                        <Package className="text-slate-400" size={20} />
                                                    )}
                                                </div>
                                            </td>

                                            {/* Name */}
                                            <td className="py-4 px-4">
                                                <div>
                                                    <span className="font-semibold text-slate-800 line-clamp-1 hover:text-red-600 transition">
                                                        {item.tenSanPham}
                                                    </span>
                                                    <span className="text-slate-400 text-xs mt-0.5 block">
                                                        ID Biến thể: #{item.sanPhamChiTietId}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-4 px-4">
                                                <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                                                    {item.tenDanhMuc || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Size */}
                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                                                    {item.size}
                                                </span>
                                            </td>

                                            {/* Color */}
                                            <td className="py-4 px-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                                                    {item.mauSac}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="py-4 px-4 text-right font-bold text-slate-900">
                                                {formatPrice(item.giaBan)}
                                            </td>

                                            {/* Stock quick adjuster */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="flex items-center gap-1">
                                                        {/* Decrease button */}
                                                        <button
                                                            onClick={() => handleDecrement(item.sanPhamChiTietId)}
                                                            disabled={isSaving || (editedValue !== undefined ? editedValue : item.soLuongTon) <= 0}
                                                            className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 transition active:scale-90 disabled:opacity-40 disabled:scale-100"
                                                        >
                                                            <Minus size={14} />
                                                        </button>

                                                        {/* Input */}
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editedValue !== undefined ? editedValue : item.soLuongTon}
                                                            onChange={(e) => handleStockChange(item.sanPhamChiTietId, e.target.value)}
                                                            disabled={isSaving}
                                                            className="w-16 py-1 text-center font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />

                                                        {/* Increase button */}
                                                        <button
                                                            onClick={() => handleIncrement(item.sanPhamChiTietId)}
                                                            disabled={isSaving}
                                                            className="p-1.5 rounded-lg border bg-white text-slate-600 hover:bg-slate-50 transition active:scale-90 disabled:opacity-40"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Quick actions save / cancel */}
                                                    {isChanged && !isSaving && (
                                                        <div className="flex items-center gap-2 animate-fadeIn">
                                                            <button
                                                                onClick={() => handleSaveStock(item.sanPhamChiTietId, item.soLuongTon)}
                                                                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md transition duration-150 shadow-sm active:scale-95"
                                                            >
                                                                <Check size={12} />
                                                                Lưu
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelStock(item.sanPhamChiTietId, item.soLuongTon)}
                                                                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition duration-150 active:scale-95"
                                                            >
                                                                <X size={12} />
                                                                Hủy
                                                            </button>
                                                        </div>
                                                    )}

                                                    {isSaving && (
                                                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                                            <Loader2 size={12} className="animate-spin text-slate-400" />
                                                            Đang lưu...
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status badge */}
                                            <td className="py-4 px-4 text-center">
                                                {renderStatusBadge(editedValue !== undefined ? editedValue : item.soLuongTon)}
                                            </td>

                                            {/* Action links */}
                                            <td className="py-4 px-6 text-center">
                                                <Link
                                                    to={`/admin/products/${item.sanPhamId}/variants`}
                                                    title="Sửa chi tiết biến thể"
                                                    className="inline-flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition duration-150 active:scale-90"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="text-xs text-slate-500 font-medium">
                            Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} trong tổng số <span className="font-bold text-slate-700">{totalCount}</span> biến thể
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border bg-white hover:bg-slate-50 transition text-slate-600 disabled:opacity-40 disabled:hover:bg-white"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 text-sm font-semibold rounded-lg transition ${currentPage === page
                                        ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                                        : 'border bg-white hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border bg-white hover:bg-slate-50 transition text-slate-600 disabled:opacity-40 disabled:hover:bg-white"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryPage;
