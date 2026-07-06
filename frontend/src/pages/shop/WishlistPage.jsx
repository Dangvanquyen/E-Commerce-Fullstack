import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = async (sanPhamId) => {
    // Tìm sản phẩm trong wishlist để lấy variant đầu tiên
    const product = wishlist.find(item => item.sanPhamId === sanPhamId);
    if (!product) return;

    // Giả sử thêm variant đầu tiên vào giỏ (cần điều chỉnh theo logic thực tế)
    toast.info('Vui lòng chọn size và màu trong trang chi tiết sản phẩm');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart size={80} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <Link to="/login" className="text-red-600 font-bold hover:underline">Đăng nhập ngay</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart size={80} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Danh sách yêu thích trống</h2>
        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm yêu thích để xem lại sau!</p>
        <Link to="/shop" className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Sản phẩm yêu thích</h1>
        <span className="text-gray-500">{wishlist.length} sản phẩm</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.yeuThichId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
            {/* Ảnh sản phẩm */}
            <Link to={`/product/${item.sanPhamId}`} className="relative block overflow-hidden bg-gray-50">
              <img
                src={item.hinhAnh || 'https://placehold.co/400x500?text=No+Image'}
                alt={item.tenSanPham}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500?text=Error'; }}
              />
              
              {/* Nút xóa */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromWishlist(item.sanPhamId);
                }}
                className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-600 transition z-10"
              >
                <Trash2 size={18} />
              </button>

              {/* Badge trạng thái */}
              {!item.trangThai && (
                <div className="absolute top-3 left-3 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
                  Hết hàng
                </div>
              )}
            </Link>

            {/* Thông tin sản phẩm */}
            <div className="p-4">
              <Link to={`/product/${item.sanPhamId}`}>
                <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 hover:text-red-600 transition">
                  {item.tenSanPham}
                </h3>
              </Link>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl font-bold text-red-600">{formatPrice(item.gia)}</span>
              </div>

              {/* Nút xem chi tiết */}
              <Link
                to={`/product/${item.sanPhamId}`}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Xem chi tiết
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
