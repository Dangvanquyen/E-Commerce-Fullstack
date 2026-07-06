import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Loader2,
    X,
    Check,
    FolderTree
} from 'lucide-react';
import categoryApi from '../../api/categoryApi';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        tenDanhMuc: '',
        moTa: '',
        trangThai: true
    });
    const [saving, setSaving] = useState(false);

    // Delete confirmation
    const [deleteId, setDeleteId] = useState(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryApi.getAll();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories by search
    const filteredCategories = categories.filter(cat =>
        cat.tenDanhMuc?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Open modal for new category
    const handleAddNew = () => {
        setEditingCategory(null);
        setFormData({ tenDanhMuc: '', moTa: '', trangThai: true });
        setShowModal(true);
    };

    // Open modal for edit
    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            tenDanhMuc: category.tenDanhMuc || '',
            moTa: category.moTa || '',
            trangThai: category.trangThai ?? true
        });
        setShowModal(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tenDanhMuc.trim()) {
            toast.error('Vui lòng nhập tên danh mục');
            return;
        }

        try {
            setSaving(true);

            if (editingCategory) {
                // Update
                const response = await categoryApi.update(editingCategory.danhMucId, formData);
                if (response.success) {
                    toast.success('Cập nhật danh mục thành công');
                    setShowModal(false);
                    fetchCategories();
                }
            } else {
                // Create
                const response = await categoryApi.create(formData);
                if (response.success) {
                    toast.success('Thêm danh mục thành công');
                    setShowModal(false);
                    fetchCategories();
                }
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDelete = async (id) => {
        try {
            const response = await categoryApi.delete(id);
            if (response.success) {
                toast.success('Xóa danh mục thành công');
                setDeleteId(null);
                fetchCategories();
            }
        } catch (error) {
            toast.error('Không thể xóa danh mục');
        }
    };

    // Toggle status
    const handleToggleStatus = async (category) => {
        try {
            const response = await categoryApi.updateStatus(category.danhMucId, !category.trangThai);
            if (response.success) {
                toast.success('Cập nhật trạng thái thành công');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
                    <p className="text-gray-500">Quản lý các danh mục sản phẩm</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
                >
                    <Plus size={20} />
                    Thêm danh mục
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                <div className="relative max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
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
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tên danh mục</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <FolderTree size={48} className="mx-auto mb-3 text-gray-300" />
                                            <p>Chưa có danh mục nào</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category) => (
                                        <tr key={category.danhMucId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-gray-500">#{category.danhMucId}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{category.tenDanhMuc}</td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{category.moTa || '-'}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(category)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition
                            ${category.trangThai
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {category.trangThai ? 'Hoạt động' : 'Ẩn'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(category.danhMucId)}
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
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Tên danh mục *</label>
                                    <input
                                        type="text"
                                        value={formData.tenDanhMuc}
                                        onChange={(e) => setFormData({ ...formData, tenDanhMuc: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Ví dụ: Áo khoác, Quần jean..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Mô tả</label>
                                    <textarea
                                        value={formData.moTa}
                                        onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        rows={3}
                                        placeholder="Mô tả ngắn về danh mục..."
                                    />
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
                                    {editingCategory ? 'Cập nhật' : 'Thêm mới'}
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
                        <p className="text-gray-500 mb-6">Bạn có chắc muốn xóa danh mục này? Hành động không thể hoàn tác.</p>
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

export default CategoriesPage;
