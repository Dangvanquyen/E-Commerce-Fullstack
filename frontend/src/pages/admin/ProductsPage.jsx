import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Loader2,
    Package,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Settings,
    Palette,
    Ruler
} from 'lucide-react';
import adminProductApi from '../../api/adminProductApi';
import categoryApi from '../../api/categoryApi';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Phân nhóm danh mục theo thời trang Nam/Nữ/Khác
    const menCategories = useMemo(() => categories.filter(cat => cat.tenDanhMuc?.toLowerCase().includes('nam')), [categories]);
    const womenCategories = useMemo(() => categories.filter(cat => cat.tenDanhMuc?.toLowerCase().includes('nữ')), [categories]);
    const otherCategories = useMemo(() => categories.filter(cat => 
        !cat.tenDanhMuc?.toLowerCase().includes('nam') && 
        !cat.tenDanhMuc?.toLowerCase().includes('nữ')
    ), [categories]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    // Filter and Sort products client-side
    const filteredAndSortedProducts = useMemo(() => {
        let result = [...products];

        // Filter by status
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter(p => p.trangThai === isActive);
        }

        // Filter by stock
        if (stockFilter !== 'all') {
            result = result.filter(p => {
                const totalStock = p.sanPhamChiTiets?.reduce((sum, v) => sum + (v.soLuongTon || 0), 0) || 0;
                return stockFilter === 'in_stock' ? totalStock > 0 : totalStock === 0;
            });
        }

        // Sort
        if (sortBy === 'newest') {
            result.sort((a, b) => b.sanPhamId - a.sanPhamId);
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => a.sanPhamId - b.sanPhamId);
        } else if (sortBy === 'price_asc') {
            result.sort((a, b) => a.gia - b.gia);
        } else if (sortBy === 'price_desc') {
            result.sort((a, b) => b.gia - a.gia);
        }

        return result;
    }, [products, statusFilter, stockFilter, sortBy]);

    // Delete modal
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch products
    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);
            const response = await adminProductApi.getPaged(page, pageSize);
            if (response.success && response.data) {
                setProducts(response.data.items || []);
                setTotalCount(response.data.totalCount || 0);
                setTotalPages(Math.ceil((response.data.totalCount || 0) / pageSize));
            }
        } catch (error) {
            toast.error('Không thể tải danh sách sản phẩm');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories for filter
    const fetchCategories = async () => {
        try {
            const response = await categoryApi.getActive();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage);
        fetchCategories();
    }, [currentPage]);

    // Search products
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchProducts(1);
            return;
        }

        try {
            setLoading(true);
            const response = await adminProductApi.search(searchQuery);
            if (response.success) {
                setProducts(response.data || []);
                setTotalCount(response.data?.length || 0);
                setTotalPages(1);
            }
        } catch (error) {
            toast.error('Lỗi tìm kiếm');
        } finally {
            setLoading(false);
        }
    };

    // Filter by category
    const handleCategoryFilter = async (catId) => {
        setSelectedCategory(catId);
        if (!catId) {
            fetchProducts(1);
            return;
        }

        try {
            setLoading(true);
            const response = await adminProductApi.getByCategory(catId);
            if (response.success) {
                setProducts(response.data || []);
                setTotalCount(response.data?.length || 0);
                setTotalPages(1);
            }
        } catch (error) {
            toast.error('Lỗi lọc theo danh mục');
        } finally {
            setLoading(false);
        }
    };

    // Delete product
    const handleDelete = async () => {
        try {
            setDeleting(true);
            const response = await adminProductApi.delete(deleteId);
            if (response.success) {
                toast.success('Xóa sản phẩm thành công');
                setDeleteId(null);
                fetchProducts(currentPage);
            }
        } catch (error) {
            toast.error('Không thể xóa sản phẩm');
        } finally {
            setDeleting(false);
        }
    };

    // Toggle status
    const handleToggleStatus = async (product) => {
        try {
            const response = await adminProductApi.updateStatus(product.sanPhamId, !product.trangThai);
            if (response.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchProducts(currentPage);
            }
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    // Get variant count display
    const getVariantInfo = (product) => {
        const variants = product.sanPhamChiTiets || [];
        if (variants.length === 0) return { count: 0, colors: 0, sizes: 0 };
        
        const colors = [...new Set(variants.map(v => v.mauSac).filter(Boolean))];
        const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
        
        return {
            count: variants.length,
            colors: colors.length,
            sizes: sizes.length
        };
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
                    <p className="text-gray-500">Hiển thị {filteredAndSortedProducts.length} trên tổng số {totalCount} sản phẩm</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2 w-fit"
                >
                    <Plus size={20} />
                    Thêm sản phẩm
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col gap-4">
                    {/* Row 1: Search & Category */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        {/* Category filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryFilter(e.target.value)}
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-w-[200px]"
                        >
                            <option value="">Tất cả danh mục</option>
                            {menCategories.length > 0 && (
                                <optgroup label="Thời Trang Nam">
                                    {menCategories.map(cat => (
                                        <option key={cat.danhMucId} value={cat.danhMucId}>{cat.tenDanhMuc}</option>
                                    ))}
                                </optgroup>
                            )}
                            {womenCategories.length > 0 && (
                                <optgroup label="Thời Trang Nữ">
                                    {womenCategories.map(cat => (
                                        <option key={cat.danhMucId} value={cat.danhMucId}>{cat.tenDanhMuc}</option>
                                    ))}
                                </optgroup>
                            )}
                            {otherCategories.length > 0 && (
                                <optgroup label="Khác / Phụ Kiện">
                                    {otherCategories.map(cat => (
                                        <option key={cat.danhMucId} value={cat.danhMucId}>{cat.tenDanhMuc}</option>
                                    ))}
                                </optgroup>
                            )}
                        </select>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                        >
                            Tìm kiếm
                        </button>
                    </div>

                    {/* Row 2: Advanced filters (Status, Stock, Sort) */}
                    <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-gray-100">
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="all">Tất cả</option>
                                <option value="active">Đang hiện</option>
                                <option value="inactive">Đang ẩn</option>
                            </select>
                        </div>

                        {/* Stock Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Kho hàng:</span>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="all">Tất cả</option>
                                <option value="in_stock">Còn hàng</option>
                                <option value="out_stock">Hết hàng</option>
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="flex items-center gap-2 md:ml-auto">
                            <span className="text-sm font-medium text-gray-500">Sắp xếp:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
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
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-16">Ảnh</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">Danh mục</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">Biến thể</th>
                                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase w-28">Giá bán</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-24">Trạng thái</th>
                                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredAndSortedProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <Package size={48} className="mx-auto mb-3 text-gray-300" />
                                                <p>Không tìm thấy sản phẩm nào khớp với bộ lọc</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAndSortedProducts.map((product) => {
                                            const variantInfo = getVariantInfo(product);
                                            return (
                                                <tr key={product.sanPhamId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border">
                                                            <img
                                                                src={product.hinhAnh || 'https://via.placeholder.com/60x60?text=No+Image'}
                                                                alt={product.tenSanPham}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => e.target.src = 'https://via.placeholder.com/60x60?text=No+Image'}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-gray-800 line-clamp-1">{product.tenSanPham}</p>
                                                            <p className="text-xs text-gray-400">ID: #{product.sanPhamId}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-gray-600">{product.danhMucTen || '-'}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Palette size={12} />
                                                                <span>{variantInfo.colors}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                <Ruler size={12} />
                                                                <span>{variantInfo.sizes}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">{variantInfo.count} biến thể</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <p className="font-semibold text-red-600">{formatPrice(product.gia)}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() => handleToggleStatus(product)}
                                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition
                                                                ${product.trangThai
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                        >
                                                            {product.trangThai ? <Eye size={12} /> : <EyeOff size={12} />}
                                                            {product.trangThai ? 'Hiện' : 'Ẩn'}
                                                        </button>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Link
                                                                to={`/admin/products/${product.sanPhamId}/variants`}
                                                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                                title="Quản lý biến thể"
                                                            >
                                                                <Settings size={16} />
                                                            </Link>
                                                            <Link
                                                                to={`/admin/products/${product.sanPhamId}/edit`}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Sửa"
                                                            >
                                                                <Edit2 size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => setDeleteId(product.sanPhamId)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Xóa"
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
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa sản phẩm</h3>
                            <p className="text-gray-500 mb-6">
                                Bạn có chắc chắn muốn xóa sản phẩm này không? 
                                <br />
                                <span className="font-medium text-red-600">Hành động này không thể hoàn tác!</span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    {deleting && <Loader2 size={16} className="animate-spin" />}
                                    Xóa sản phẩm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
