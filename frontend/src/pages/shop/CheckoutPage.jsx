import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  CreditCard, 
  Wallet, 
  Truck, 
  Loader2, 
  CheckCircle, 
  ArrowLeft,
  ShoppingBag 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import orderApi from '../../api/orderApi';
import paymentApi from '../../api/paymentApi';
import voucherApi from '../../api/voucherApi';
import BankingQRCode from '../../components/BankingQRCode';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook để nhận dữ liệu từ navigate
  const { cart, refreshCart } = useCart(); 
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showBankingQR, setShowBankingQR] = useState(false);

  // Voucher states
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  const [form, setForm] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    diaChiGiaoHang: '',
    ghiChu: '',
    phuongThucThanhToan: 'COD'
  });

  // --- LOGIC PHÂN LOẠI MUA HÀNG ---
  // Kiểm tra xem có phải "Mua ngay" không?
  const buyNowData = location.state?.buyNowItem;

  // Lấy các sản phẩm được chọn từ giỏ hàng (nếu có)
  const checkoutItems = location.state?.checkoutItems;

  // Nếu có buyNowData thì dùng nó, ngược lại dùng checkoutItems (sản phẩm đã chọn), cuối cùng là toàn bộ giỏ hàng
  const cartItems = buyNowData || checkoutItems || cart?.chiTiets || [];

  // Tính tổng tiền dựa trên danh sách item ĐANG HIỂN THỊ (cartItems)
  const subTotal = cartItems.reduce((total, item) => {
    // Logic fallback giá
    const detail = item.sanPhamChiTiet || {};
    const productInfo = detail.sanPham || detail.SanPham || item.sanPham || item.SanPham || {};
    
    // Giá ưu tiên: item.giaBan (từ BuyNow) -> detail.giaBan -> product.gia -> 0
    const price = item.giaBan || detail.giaBan || detail.donGia || productInfo.gia || item.gia || 0;
    const quantity = item.soLuong || 1;
    return total + (price * quantity);
  }, 0);

  const [shippingMethod, setShippingMethod] = useState('Standard');

  const shippingMethods = [
    {
      id: 'Standard',
      name: 'Giao hàng tiêu chuẩn',
      desc: 'Nhận hàng sau 3 - 5 ngày làm việc.',
      price: subTotal >= 500000 ? 0 : 30000,
      icon: Truck
    },
    {
      id: 'Fast',
      name: 'Giao hàng nhanh',
      desc: 'Nhận hàng sau 1 - 2 ngày làm việc (GHN).',
      price: 45000,
      icon: Truck
    },
    {
      id: 'Grab',
      name: 'Hỏa tốc Grab E-delivery',
      desc: 'Nhận hàng trong vòng 1 - 2 giờ (Nội thành).',
      price: 60000,
      icon: Truck
    }
  ];

  const selectedShipping = shippingMethods.find(m => m.id === shippingMethod) || shippingMethods[0];
  const shippingFee = selectedShipping.price;
  
  // ---------------------------------

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        hoTen: user.hoTen || '',
        soDienThoai: user.soDienThoai || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Load active vouchers on mount
  useEffect(() => {
    const fetchActiveVouchers = async () => {
      try {
        const response = await voucherApi.getActive();
        if (response.success) {
          setActiveVouchers(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load active vouchers:', error);
      }
    };
    fetchActiveVouchers();
  }, []);

  const handleApplyVoucher = async (codeToApply = voucherInput) => {
    if (!codeToApply.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    
    try {
      setCheckingVoucher(true);
      const response = await voucherApi.validate(codeToApply, subTotal);
      if (response.success && response.data.isValid) {
        setAppliedVoucher(response.data);
        setDiscountAmount(response.data.discountAmount);
        toast.success(response.message || 'Áp dụng mã giảm giá thành công!');
      } else {
        toast.error(response.message || 'Mã giảm giá không hợp lệ');
        setAppliedVoucher(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi kiểm tra mã giảm giá');
      setAppliedVoucher(null);
      setDiscountAmount(0);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherInput('');
    toast.info('Đã hủy áp dụng mã giảm giá');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.diaChiGiaoHang.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    if (!form.hoTen.trim() || !form.soDienThoai.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin người nhận');
      return;
    }

    try {
      setLoading(true);
      
      const notePart = form.ghiChu.trim() ? ` (Ghi chú: ${form.ghiChu.trim()})` : '';
      const finalAddress = `${form.diaChiGiaoHang.trim()} [Hình thức vận chuyển: ${selectedShipping.name}]${notePart}`;
      
      // Xử lý thanh toán VNPay
      if (form.phuongThucThanhToan === 'VNPay') {
        const paymentData = {
          orderType: 'billpayment',
          amount: subTotal + shippingFee - discountAmount,
          orderDescription: `Thanh toan don hang ${buyNowData ? 'mua ngay' : 'gio hang'}`,
          name: form.hoTen
        };
        
        const paymentResponse = await paymentApi.createVnPayUrl(paymentData);
        
        if (paymentResponse.success) {
          // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi callback
          localStorage.setItem('pendingOrder', JSON.stringify({
            form: { ...form, diaChiGiaoHang: finalAddress },
            buyNowData,
            cartItems,
            voucherCode: appliedVoucher?.code,
            gioHangChiTietIds: !buyNowData && checkoutItems ? checkoutItems.map(item => item.gioHangChiTietId) : null
          }));
          
          // Redirect đến VNPay
          window.location.href = paymentResponse.data;
          return;
        }
      }
      
      // Xử lý thanh toán COD và Banking như cũ
      let response;

      if (buyNowData) {
        response = await orderApi.checkoutDirect({
          diaChiGiaoHang: finalAddress,
          phuongThucThanhToan: form.phuongThucThanhToan,
          voucherCode: appliedVoucher?.code,
          orderItems: buyNowData.map(item => ({
            sanPhamChiTietId: item.sanPhamChiTiet?.sanPhamChiTietId || item.sanPhamChiTietId,
            soLuong: item.soLuong,
            donGia: item.giaBan
          }))
        });
      } else {
        const gioHangChiTietIds = checkoutItems ? checkoutItems.map(item => item.gioHangChiTietId) : null;
        response = await orderApi.checkout(finalAddress, form.phuongThucThanhToan, appliedVoucher?.code, gioHangChiTietIds);
      }

      if (response.success) {
        const donHangId = response.data?.donHangId;
        
        if (form.phuongThucThanhToan === 'Banking') {
          setShowBankingQR(true);
          setOrderId(donHangId || 'MỚI');
          
          if (!buyNowData) {
            await refreshCart();
          }
        } else {
          setOrderSuccess(true);
          setOrderId(donHangId || 'MỚI');
          
          if (!buyNowData) {
            await refreshCart();
          }
          
          toast.success('Đặt hàng thành công!');
          window.scrollTo(0, 0);
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại!';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-6">Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-8">
            <p className="text-sm text-gray-500">Mã đơn hàng</p>
            <p className="text-xl font-bold text-gray-800">#{orderId}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/profile" className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition">
              Xem đơn hàng của tôi
            </Link>
            <Link to="/" className="w-full bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
             {buyNowData ? 'Không có sản phẩm nào để thanh toán' : 'Giỏ hàng của bạn đang trống'}
          </h2>
          <Link to="/" className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition">
            <ArrowLeft size={18} /> Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] mx-auto px-4 py-10">
      <Link to="/cart" className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 mb-8 transition">
        <ArrowLeft size={18} /> Quay lại giỏ hàng
      </Link>

      <h1 className="text-3xl font-bold mb-8 text-gray-900">Thanh toán {buyNowData ? '(Mua ngay)' : ''}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* --- CỘT TRÁI: FORM --- */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="p-2 bg-red-50 rounded-lg"><MapPin size={24} className="text-red-600" /></div>
                Thông tin giao hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" name="hoTen" value={form.hoTen} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" required />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input type="tel" name="soDienThoai" value={form.soDienThoai} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" required />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" />
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">Địa chỉ nhận hàng <span className="text-red-500">*</span></label>
                <textarea name="diaChiGiaoHang" value={form.diaChiGiaoHang} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" rows={3} required />
              </div>
              <div className="mt-6">
                <label className="block text-gray-700 font-medium mb-2">Ghi chú đơn hàng</label>
                <textarea name="ghiChu" value={form.ghiChu} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition" rows={2} />
              </div>
            </div>

            {/* --- PHƯƠNG THỨC VẬN CHUYỂN --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fadeIn">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="p-2 bg-red-50 rounded-lg"><Truck size={24} className="text-red-600" /></div>
                Phương thức vận chuyển
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shippingMethods.map((method) => {
                  const MethodIcon = method.icon;
                  const isSelected = shippingMethod === method.id;
                  return (
                    <label 
                      key={method.id}
                      className={`flex flex-col justify-between p-4 border rounded-xl cursor-pointer transition h-full ${
                        isSelected ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="shippingMethod" 
                        value={method.id} 
                        checked={isSelected} 
                        onChange={() => setShippingMethod(method.id)} 
                        className="sr-only"
                      />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-sm">{method.name}</span>
                          <div className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">{method.desc}</p>
                      </div>
                      <div className="text-sm font-bold text-red-600 mt-auto pt-2">
                        {method.price === 0 ? 'Miễn phí' : formatPrice(method.price)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="p-2 bg-red-50 rounded-lg"><CreditCard size={24} className="text-red-600" /></div>
                Phương thức thanh toán
              </h2>
              <div className="space-y-4">
                <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition ${form.phuongThucThanhToan === 'COD' ? 'border-red-500 bg-red-50/50' : 'hover:border-gray-300'}`}>
                  <input type="radio" name="phuongThucThanhToan" value="COD" checked={form.phuongThucThanhToan === 'COD'} onChange={handleChange} className="mt-1 w-5 h-5 text-red-600 focus:ring-red-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><Truck size={20} className="text-gray-700" /><span className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</span></div>
                    <p className="text-sm text-gray-500">Thanh toán tiền mặt khi nhận hàng.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition ${form.phuongThucThanhToan === 'Banking' ? 'border-red-500 bg-red-50/50' : 'hover:border-gray-300'}`}>
                  <input type="radio" name="phuongThucThanhToan" value="Banking" checked={form.phuongThucThanhToan === 'Banking'} onChange={handleChange} className="mt-1 w-5 h-5 text-red-600 focus:ring-red-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><Wallet size={20} className="text-gray-700" /><span className="font-bold text-gray-900">Chuyển khoản ngân hàng</span></div>
                    <p className="text-sm text-gray-500">Quét mã QR hoặc chuyển khoản ngân hàng.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-5 border rounded-xl cursor-pointer transition ${form.phuongThucThanhToan === 'VNPay' ? 'border-red-500 bg-red-50/50' : 'hover:border-gray-300'}`}>
                  <input type="radio" name="phuongThucThanhToan" value="VNPay" checked={form.phuongThucThanhToan === 'VNPay'} onChange={handleChange} className="mt-1 w-5 h-5 text-red-600 focus:ring-red-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><CreditCard size={20} className="text-gray-700" /><span className="font-bold text-gray-900">Thanh toán VNPay</span></div>
                    <p className="text-sm text-gray-500">Thanh toán qua cổng VNPay (ATM, Visa, MasterCard, QR Code).</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-5 pb-4 border-b border-gray-200">
                Đơn hàng của bạn 
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {cartItems.map((item) => {
                  // Fallback dữ liệu an toàn
                  const detail = item.sanPhamChiTiet || {};
                  const productInfo = detail.sanPham || detail.SanPham || item.sanPham || item.SanPham || {};

                  const name = item.tenSanPham || productInfo.tenSanPham || productInfo.TenSanPham || "Sản phẩm";
                  const image = item.hinhAnh || detail.hinhAnh || productInfo.hinhAnh || 'https://placehold.co/150x150?text=No+Image';
                  
                  // Giá và Số lượng
                  const unitPrice = item.giaBan || detail.giaBan || detail.donGia || productInfo.gia || item.gia || 0;
                  const quantity = item.soLuong || 1;
                  const totalPrice = unitPrice * quantity;
                  
                  const color = item.mauSac || detail.mauSac || detail.MauSac || '';
                  const size = item.size || detail.size || detail.Size || detail.KichThuoc || '';

                  return (
                    <div key={item.gioHangChiTietId || Math.random()} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                      {/* 1. Ảnh */}
                      <div className="relative shrink-0 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img 
                          src={image} 
                          alt={name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=Error'; }}
                        />
                      </div>

                      {/* 2. Thông tin chính (Flex Row) */}
                      <div className="flex-1 flex justify-between items-start">
                        {/* Bên trái: Tên & Thuộc tính */}
                        <div className="pr-2">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1" title={name}>
                            {name}
                          </h3>
                          {(color && color.trim() && color !== 'Mặc định') || (size && size.trim() && size !== 'Mặc định') ? (
                            <p className="text-xs text-gray-500">
                              {[
                                color && color.trim() && color !== 'Mặc định' ? color : null,
                                size && size.trim() && size !== 'Mặc định' ? size : null
                              ].filter(Boolean).join(' | ')}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className="text-sm font-bold text-red-600">
                            {formatPrice(totalPrice)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium mt-1">
                            x{quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tính tiền */}
              <div className="mt-4 pt-4 border-t border-dashed border-gray-300 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(subTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 text-sm font-semibold animate-fadeIn">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Phí vận chuyển</span>
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-xs font-bold">Miễn phí</span>
                  ) : (
                    <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
                  )}
                </div>
              </div>

              {/* Mã giảm giá */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mã giảm giá / Voucher</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder="NHẬP MÃ (Ví dụ: KM50K)"
                    disabled={!!appliedVoucher}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  {appliedVoucher ? (
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                    >
                      Hủy
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyVoucher()}
                      disabled={checkingVoucher || !voucherInput.trim()}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkingVoucher ? <Loader2 size={16} className="animate-spin" /> : 'Áp dụng'}
                    </button>
                  )}
                </div>
                {appliedVoucher && (
                  <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold flex items-center justify-between">
                    <span>Đã áp dụng: {appliedVoucher.code} ({appliedVoucher.message})</span>
                  </div>
                )}
                
                {/* Danh sách mã giảm giá khả dụng */}
                {activeVouchers.length > 0 && !appliedVoucher && (
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mã giảm giá khả dụng</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {activeVouchers.map((voucher) => {
                        const isEligible = subTotal >= voucher.donHangToiThieu;
                        return (
                          <button
                            key={voucher.maGiamGiaId}
                            type="button"
                            onClick={() => {
                              if (isEligible) {
                                setVoucherInput(voucher.code);
                                handleApplyVoucher(voucher.code);
                              }
                            }}
                            disabled={!isEligible}
                            className={`text-[10px] px-2 py-1 rounded border transition font-medium ${
                              isEligible 
                                ? 'border-red-200 bg-red-50/30 text-red-600 hover:bg-red-50' 
                                : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }`}
                            title={voucher.moTa + (isEligible ? '' : ` (Đơn hàng từ ${voucher.donHangToiThieu.toLocaleString()}đ)`)}
                          >
                            {voucher.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-gray-900">Tổng thanh toán</span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-red-600">{formatPrice(subTotal + shippingFee - discountAmount)}</span>
                    <span className="text-xs text-gray-400 font-normal">(Đã bao gồm VAT)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className={`w-full mt-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-red-200 transition transform active:scale-[0.99] flex items-center justify-center gap-2
                  ${loading || cartItems.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                {loading ? <><Loader2 size={24} className="animate-spin" /><span>Đang xử lý...</span></> : <><span>Đặt hàng ngay</span><ArrowLeft size={20} className="rotate-180" /></>}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle size={14} className="text-green-500" />
                <span>Bảo mật thông tin khách hàng tuyệt đối</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Banking QR Code Modal */}
      {showBankingQR && (
        <BankingQRCode
          amount={subTotal + shippingFee - discountAmount}
          orderInfo={`DH${orderId}`}
          onClose={() => {
            setShowBankingQR(false);
            setOrderSuccess(true);
            toast.success('Đơn hàng đã được tạo! Vui lòng chuyển khoản để hoàn tất.');
            window.scrollTo(0, 0);
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;