import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Format tiền tệ
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // --- TÍNH TOÁN LẠI TỔNG TIỀN (FIX LỖI 0đ) ---
  const cartItems = cart?.chiTiets || [];

  // Khởi tạo và đồng bộ hóa sản phẩm được chọn
  useEffect(() => {
    if (cartItems.length > 0) {
      const itemIds = cartItems.map(item => item.gioHangChiTietId);
      if (!isInitialized) {
        setSelectedIds(itemIds);
        setIsInitialized(true);
      } else {
        // Sync selected items in case some were deleted
        setSelectedIds(prev => prev.filter(id => itemIds.includes(id)));
      }
    } else {
      setSelectedIds([]);
      setIsInitialized(false);
    }
  }, [cartItems, isInitialized]);

  // Lấy các sản phẩm được chọn
  const selectedCartItems = cartItems.filter(item => selectedIds.includes(item.gioHangChiTietId));
  
  // Tính tổng tiền dựa trên danh sách các sản phẩm đã được tích chọn
  const subTotal = selectedCartItems.reduce((total, item) => {
    const price = item.giaBan || 0;
    const quantity = item.soLuong || 1;
    return total + (price * quantity);
  }, 0);

  // Tính tổng số lượng sản phẩm được chọn
  const currentTotalItems = selectedCartItems.reduce((total, item) => total + item.soLuong, 0);

  // Tính tổng số lượng tất cả sản phẩm trong giỏ hàng
  const totalCartItemsCount = cartItems.reduce((total, item) => total + item.soLuong, 0);

  // Tính phí vận chuyển (Miễn phí từ 500k)
  const shippingFee = subTotal === 0 || subTotal >= 500000 ? 0 : 30000;
  const grandTotal = subTotal + shippingFee;

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }
    navigate('/checkout', { state: { checkoutItems: selectedCartItems } });
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <Link to="/login" className="text-red-600 font-bold hover:underline">Đăng nhập ngay</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={40} /></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <Link to="/" className="text-red-600 font-bold hover:underline">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    // YÊU CẦU: Độ rộng trang 90%
    <div className="w-[90%] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Giỏ hàng của bạn</h1>
        <span className="text-gray-500">{totalCartItemsCount} sản phẩm</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- CỘT TRÁI: ĐÃ THIẾT KẾ LẠI GIỐNG ẢNH MẪU --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chọn tất cả */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <input
              type="checkbox"
              id="selectAll"
              checked={cartItems.length > 0 && selectedIds.length === cartItems.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds(cartItems.map(item => item.gioHangChiTietId));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="selectAll" className="font-bold text-gray-700 cursor-pointer select-none">
              Chọn tất cả ({cartItems.length} sản phẩm)
            </label>
          </div>

          {cartItems.map((item) => {
            // Lấy dữ liệu phẳng theo console log
            const image = item.hinhAnh || 'https://placehold.co/200x200?text=No+Image';
            const name = item.tenSanPham || 'Sản phẩm chưa đặt tên';
            const price = item.giaBan || 0;
            const color = item.mauSac;
            const size = item.size;
            const productIdLink = item.sanPhamId || item.sanPhamChiTietId;

            return (
              // Style Card: Flex row (ngang), bo góc, nền trắng
              <div key={item.gioHangChiTietId} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 sm:gap-6">
                
                {/* Checkbox chọn sản phẩm */}
                <div className="flex items-center shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.gioHangChiTietId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(prev => [...prev, item.gioHangChiTietId]);
                      } else {
                        setSelectedIds(prev => prev.filter(id => id !== item.gioHangChiTietId));
                      }
                    }}
                    className="w-5 h-5 rounded text-red-600 focus:ring-red-500 border-gray-300 cursor-pointer"
                  />
                </div>

                <div className="flex-1 flex flex-col sm:flex-row gap-6">
                  {/* 1. Ảnh bên trái */}
                  <Link to={`/product/${productIdLink}`} className="w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <img 
                      src={image} 
                      alt={name} 
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200?text=Error'; }}
                    />
                  </Link>

                  {/* 2. Thông tin ở giữa */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/product/${productIdLink}`}>
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-red-600 transition">
                            {name}
                          </h3>
                        </Link>
                        {(color && color.trim() && color !== 'Mặc định') || (size && size.trim() && size !== 'Mặc định') ? (
                          <p className="text-gray-500 text-sm mt-1">
                            {[
                              color && color.trim() && color !== 'Mặc định' ? color : null,
                              size && size.trim() && size !== 'Mặc định' ? size : null
                            ].filter(Boolean).join(' • ')}
                          </p>
                        ) : null}
                      </div>
                      
                      {/* Giá tiền nằm góc phải trên */}
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(price)}
                      </span>
                    </div>

                    {/* 3. Nút chức năng ở dưới */}
                    <div className="flex justify-between items-end mt-4 sm:mt-0">
                      {/* Bộ đếm số lượng */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white h-10">
                        <button
                          onClick={() => updateQuantity(item.gioHangChiTietId, item.soLuong - 1)}
                          className="px-3 h-full hover:bg-gray-50 disabled:opacity-50 transition"
                          disabled={item.soLuong <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 font-medium min-w-[30px] text-center">{item.soLuong}</span>
                        <button
                          onClick={() => updateQuantity(item.gioHangChiTietId, item.soLuong + 1)}
                          className="px-3 h-full hover:bg-gray-50 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Nút Xóa */}
                      <button
                        onClick={() => removeFromCart(item.gioHangChiTietId)}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition text-sm font-medium"
                      >
                        <Trash2 size={18} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button onClick={clearCart} className="text-gray-500 hover:text-red-600 transition text-sm underline mt-4">
            Xóa tất cả sản phẩm
          </button>
        </div>

        {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                {/* Thay biến totalItems bằng currentTotalItems đã tính ở trên */}
                <span>Tạm tính ({currentTotalItems} sản phẩm)</span>
                {/* Thay biến totalAmount bằng subTotal đã tính ở trên để hiện giá trị thật */}
                <span>{formatPrice(subTotal)}</span> 
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="text-green-600 font-medium">Miễn phí</span>
                ) : (
                  <span className="text-gray-900 font-medium">{formatPrice(shippingFee)}</span>
                )}
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Tổng cộng</span>
              <span className="text-red-600">{formatPrice(grandTotal)}</span>
            </div>

            {/* Nút thanh toán */}
            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              Tiến hành thanh toán <ArrowRight size={18} />
            </button>

            <Link
              to="/"
              className="block text-center text-gray-500 hover:text-red-600 transition mt-4 text-sm"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;