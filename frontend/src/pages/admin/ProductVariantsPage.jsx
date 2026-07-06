import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Package,
    Palette,
    Ruler,
    DollarSign,
    Hash,
    Save,
    X,
    Image
} from 'lucide-react';
import adminProductApi from '../../api/adminProductApi';
import productVariantApi from '../../api/productVariantApi';

const ProductVariantsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    
    // Form data
    const [formData, setFormData] = useState({
        size: '',
        mauSac: '',
        soLuongTon: '',
        giaBan: '',
        hinhAnh: ''
    });
    
    const [errors, setErrors] = useState({});

    // Fetch product and variants
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch product info
                const productResponse = await adminProductApi.getById(id);
                if (productResponse.success) {
                    setProduct(productResponse.data);
                    setVariants(productResponse.data.sanPhamChiTiets || []);
                } else {
                    toast.error('Không tìm thấy sản phẩm');
                    navigate('/admin/products');
                }
            } catch (error) {
                toast.error('Không thể tải thông tin sản phẩm');
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, navigate]);

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validate = () => {
        const newErrors = {};
        
        if (!formData.size.trim()) {
            newErrors.size = 'Vui lòng nhập size';
        }
        
        if (!formData.mauSac.trim()) {
            newErrors.mauSac = 'Vui lòng nhập màu sắc';
        }
        
        if (!formData.soLuongTon || parseInt(formData.soLuongTon) < 0) {
            newErrors.soLuongTon = 'Vui lòng nhập số lượng hợp lệ';
        }
        
        if (!formData.giaBan || parseFloat(formData.giaBan) <= 0) {
            newErrors.giaBan = 'Vui lòng nhập giá bán hợp lệ';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Open modal for add/edit
    const openModal = (variant = null) => {
        if (variant) {
            setEditingVariant(variant);
            setFormData({
                size: variant.size || '',
                mauSac: variant.mauSac || '',
                soLuongTon: variant.soLuongTon?.toString() || '',
                giaBan: variant.giaBan?.toString() || '',
                hinhAnh: variant.hinhAnh || ''
            });
        } else {
            setEditingVariant(null);
            setFormData({
                size: '',
                mauSac: '',
                soLuongTon: '',
                giaBan: '',
                hinhAnh: ''
            });
        }
        setErrors({});
        setShowModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowModal(false);
        setEditingVariant(null);
        setFormData({
            size: '',
            mauSac: '',
            soLuongTon: '',
            giaBan: '',
            hinhAnh: ''
        });
        setErrors({});
    };

    // Save variant
    const handleSave = async () => {
        if (!validate()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setSaving(true);
            
            const data = {
                sanPhamId: parseInt(id),
                size: formData.size,
                mauSac: formData.mauSac,
                soLuongTon: parseInt(formData.soLuongTon),
                giaBan: parseFloat(formData.giaBan),
                hinhAnh: formData.hinhAnh || null
            };

            if (editingVariant) {
                // Update
                const response = await productVariantApi.update(editingVariant.sanPhamChiTietId, data);
                if (response.success) {
                    toast.success('Cập nhật biến thể thành công');
                    // Update local state
                    setVariants(prev => prev.map(v => 
                        v.sanPhamChiTietId === editingVariant.sanPhamChiTietId 
                            ? { ...v, ...data }
                            : v
                    ));
                }
            } else {
                // Create
                const response = await productVariantApi.create(data);
                if (response.success) {
                    toast.success('Thêm biến thể thành công');
                    // Add to local state
                    setVariants(prev => [...prev, response.data]);
                }
            }
            
            closeModal();
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // Delete variant
    const handleDelete = async () => {
        try {
            setDeleting(true);
            const response = await productVariantApi.delete(deleteId);
            if (response.success) {
                toast.success('Xóa biến thể thành công');
                setVariants(prev => prev.filter(v => v.sanPhamChiTietId !== deleteId));
                setDeleteId(null);
            }
        } catch (error) {
            toast.error('Không thể xóa biến thể');
        } finally {
            setDeleting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-red-600" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-20">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Không tìm thấy sản phẩm</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link
                    to="/admin/products"
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Biến thể</h1>
                    <p className="text-gray-500">{product.tenSanPham}</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Thêm biến thể
                </button>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border">
                        <img
                            src={product.hinhAnh || 'https://via.placeholder.com/80x80?text=No+Image'}
                            alt={product.tenSanPham}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/80x80?text=No+Image'}
                        />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800">{product.tenSanPham}</h2>
                        <p className="text-gray-500">ID: #{product.sanPhamId}</p>
                        <p className="text-gray-600">Danh mục: {product.danhMucTen}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{formatPrice(product.gia)}</p>
                        <p className="text-sm text-gray-500">{variants.length} biến thể</p>
                    </div>
                </div>
            </div>

            {/* Variants Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Danh sách Biến thể</h3>
                </div>

                {variants.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">Chưa có biến thể nào</p>
                        <button
                            onClick={() => openModal()}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                        >
                            Thêm biến thể đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase w-20">
                                        <div className="flex items-center gap-2">
                                            <Image size={16} />
                                            Ảnh
                                        </div>
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                        <div className="flex items-center gap-2">
                                            <Ruler size={16} />
                                            Size
                                        </div>
                                    </th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                        <div className="flex items-center gap-2">
                                            <Palette size={16} />
                                            Màu sắc
                                        </div>
                                    </th>
                                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                        <div className="flex items-center justify-center gap-2">
                                            <Hash size={16} />
                                            Số lượng
                                        </div>
                                    </th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                                        <div className="flex items-center justify-end gap-2">
                                            <DollarSign size={16} />
                                            Giá bán
                                        </div>
                                    </th>
                                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase w-24">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {variants.map((variant) => (
                                    <tr key={variant.sanPhamChiTietId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border">
                                                <img
                                                    src={variant.hinhAnh || product.hinhAnh || 'https://via.placeholder.com/48x48?text=No+Image'}
                                                    alt={`${variant.mauSac} ${variant.size}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/48x48?text=No+Image'}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">
                                                {variant.size}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ 
                                                        backgroundColor: variant.mauSac === 'Đen' ? '#000' : 
                                                                         variant.mauSac === 'Trắng' ? '#fff' : 
                                                                         variant.mauSac === 'Đỏ' ? '#ef4444' : 
                                                                         variant.mauSac === 'Xanh' ? '#3b82f6' : '#6b7280'
                                                    }}
                                                />
                                                <span className="text-sm font-medium text-gray-900">{variant.mauSac}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${variant.soLuongTon > 10 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : variant.soLuongTon > 0 
                                                        ? 'bg-yellow-100 text-yellow-800' 
                                                        : 'bg-red-100 text-red-800'}`}>
                                                {variant.soLuongTon}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-semibold text-red-600">
                                                {formatPrice(variant.giaBan)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => openModal(variant)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(variant.sanPhamChiTietId)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingVariant ? 'Sửa biến thể' : 'Thêm biến thể mới'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Size */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Size *
                                </label>
                                <input
                                    type="text"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                                        ${errors.size ? 'border-red-500' : ''}`}
                                    placeholder="S, M, L, XL..."
                                />
                                {errors.size && (
                                    <p className="text-red-500 text-sm mt-1">{errors.size}</p>
                                )}
                            </div>

                            {/* Color */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Màu sắc *
                                </label>
                                <input
                                    type="text"
                                    name="mauSac"
                                    value={formData.mauSac}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                                        ${errors.mauSac ? 'border-red-500' : ''}`}
                                    placeholder="Đen, Trắng, Đỏ..."
                                />
                                {errors.mauSac && (
                                    <p className="text-red-500 text-sm mt-1">{errors.mauSac}</p>
                                )}
                            </div>

                            {/* Image */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Hình ảnh biến thể
                                </label>
                                <input
                                    type="url"
                                    name="hinhAnh"
                                    value={formData.hinhAnh}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    URL ảnh cho biến thể này (nếu để trống sẽ dùng ảnh sản phẩm chính)
                                </p>
                                {formData.hinhAnh && (
                                    <div className="mt-2 relative w-20 h-20">
                                        <img
                                            src={formData.hinhAnh}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg border"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, hinhAnh: '' }))}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Số lượng tồn *
                                </label>
                                <input
                                    type="number"
                                    name="soLuongTon"
                                    value={formData.soLuongTon}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                                        ${errors.soLuongTon ? 'border-red-500' : ''}`}
                                    placeholder="0"
                                    min="0"
                                />
                                {errors.soLuongTon && (
                                    <p className="text-red-500 text-sm mt-1">{errors.soLuongTon}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    Giá bán *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="giaBan"
                                        value={formData.giaBan}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                                            ${errors.giaBan ? 'border-red-500' : ''}`}
                                        placeholder="0"
                                        min="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                                </div>
                                {errors.giaBan && (
                                    <p className="text-red-500 text-sm mt-1">{errors.giaBan}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {editingVariant ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={32} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa biến thể</h3>
                            <p className="text-gray-500 mb-6">
                                Bạn có chắc chắn muốn xóa biến thể này không?
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
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductVariantsPage;