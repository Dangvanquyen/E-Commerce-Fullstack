import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Save,
    Loader2,
    Upload,
    X
} from 'lucide-react';
import adminProductApi from '../../api/adminProductApi';
import categoryApi from '../../api/categoryApi';

const ProductFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        tenSanPham: '',
        moTa: '',
        gia: '',
        giaGoc: '',
        danhMucId: '',
        hinhAnh: '',
        trangThai: true
    });

    const [errors, setErrors] = useState({});

    // Phân nhóm danh mục theo thời trang Nam/Nữ/Khác
    const menCategories = useMemo(() => categories.filter(cat => cat.tenDanhMuc?.toLowerCase().includes('nam')), [categories]);
    const womenCategories = useMemo(() => categories.filter(cat => cat.tenDanhMuc?.toLowerCase().includes('nữ')), [categories]);
    const otherCategories = useMemo(() => categories.filter(cat => 
        !cat.tenDanhMuc?.toLowerCase().includes('nam') && 
        !cat.tenDanhMuc?.toLowerCase().includes('nữ')
    ), [categories]);

    // Fetch categories
    useEffect(() => {
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
        fetchCategories();
    }, []);

    // Fetch product data if editing
    useEffect(() => {
        const fetchProduct = async () => {
            if (!isEdit) return;

            try {
                setLoading(true);
                const response = await adminProductApi.getById(id);
                if (response.success && response.data) {
                    const product = response.data;
                    setFormData({
                        tenSanPham: product.tenSanPham || '',
                        moTa: product.moTa || '',
                        gia: product.gia || '',
                        giaGoc: product.giaGoc || '',
                        danhMucId: product.danhMucId || '',
                        hinhAnh: product.hinhAnh || '',
                        trangThai: product.trangThai ?? true
                    });
                }
            } catch (error) {
                toast.error('Không thể tải thông tin sản phẩm');
                navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.tenSanPham.trim()) {
            newErrors.tenSanPham = 'Vui lòng nhập tên sản phẩm';
        }

        if (!formData.gia || parseFloat(formData.gia) <= 0) {
            newErrors.gia = 'Vui lòng nhập giá hợp lệ';
        }

        if (!formData.danhMucId) {
            newErrors.danhMucId = 'Vui lòng chọn danh mục';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setSaving(true);

            const data = {
                ...formData,
                gia: parseFloat(formData.gia),
                giaGoc: formData.giaGoc ? parseFloat(formData.giaGoc) : null,
                danhMucId: parseInt(formData.danhMucId)
            };

            if (isEdit) {
                const response = await adminProductApi.update(id, data);
                if (response.success) {
                    toast.success('Cập nhật sản phẩm thành công');
                    navigate('/admin/products');
                }
            } else {
                const response = await adminProductApi.create(data);
                if (response.success) {
                    toast.success('Thêm sản phẩm thành công');
                    navigate('/admin/products');
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-red-600" />
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
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h1>
                    <p className="text-gray-500">
                        {isEdit ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin để tạo sản phẩm mới'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic info */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Thông tin cơ bản</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Tên sản phẩm *
                                    </label>
                                    <input
                                        type="text"
                                        name="tenSanPham"
                                        value={formData.tenSanPham}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                      ${errors.tenSanPham ? 'border-red-500' : ''}`}
                                        placeholder="Nhập tên sản phẩm"
                                    />
                                    {errors.tenSanPham && (
                                        <p className="text-red-500 text-sm mt-1">{errors.tenSanPham}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        name="moTa"
                                        value={formData.moTa}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Mô tả chi tiết về sản phẩm..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Giá bán</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Giá bán *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="gia"
                                            value={formData.gia}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                        ${errors.gia ? 'border-red-500' : ''}`}
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                                    </div>
                                    {errors.gia && (
                                        <p className="text-red-500 text-sm mt-1">{errors.gia}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">
                                        Giá gốc (nếu giảm giá)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="giaGoc"
                                            value={formData.giaGoc}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Hình ảnh</h2>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">
                                    URL hình ảnh
                                </label>
                                <input
                                    type="url"
                                    name="hinhAnh"
                                    value={formData.hinhAnh}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            {formData.hinhAnh && (
                                <div className="mt-4 relative w-40 h-40">
                                    <img
                                        src={formData.hinhAnh}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg border"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, hinhAnh: '' }))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Category */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Danh mục</h2>

                            <div>
                                <select
                                    name="danhMucId"
                                    value={formData.danhMucId}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500
                    ${errors.danhMucId ? 'border-red-500' : ''}`}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {menCategories.length > 0 && (
                                        <optgroup label="Thời Trang Nam">
                                            {menCategories.map(cat => (
                                                <option key={cat.danhMucId} value={cat.danhMucId}>
                                                    {cat.tenDanhMuc}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {womenCategories.length > 0 && (
                                        <optgroup label="Thời Trang Nữ">
                                            {womenCategories.map(cat => (
                                                <option key={cat.danhMucId} value={cat.danhMucId}>
                                                    {cat.tenDanhMuc}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                    {otherCategories.length > 0 && (
                                        <optgroup label="Khác / Phụ Kiện">
                                            {otherCategories.map(cat => (
                                                <option key={cat.danhMucId} value={cat.danhMucId}>
                                                    {cat.tenDanhMuc}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}
                                </select>
                                {errors.danhMucId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.danhMucId}</p>
                                )}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Trạng thái</h2>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="trangThai"
                                    checked={formData.trangThai}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                />
                                <span className="text-gray-700">Hiển thị sản phẩm</span>
                            </label>
                            <p className="text-sm text-gray-500 mt-2">
                                Nếu bỏ chọn, sản phẩm sẽ bị ẩn khỏi cửa hàng
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Save size={20} />
                                )}
                                {isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}
                            </button>

                            <Link
                                to="/admin/products"
                                className="block text-center text-gray-500 hover:text-gray-700 mt-4"
                            >
                                Hủy
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;
