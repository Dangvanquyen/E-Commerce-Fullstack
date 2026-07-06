import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import paymentApi from '../../api/paymentApi';
import orderApi from '../../api/orderApi';
import { useCart } from '../../context/CartContext';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [processing, setProcessing] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);

  const didRunRef = useRef(false);

  useEffect(() => {
    const handlePaymentCallback = async () => {
      if (didRunRef.current) return; // prevent double-run (StrictMode / duplicate calls)
      didRunRef.current = true;
      try {
        // Lấy tất cả query params
        const queryParams = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Gọi API xác thực thanh toán
        const response = await paymentApi.handleCallback(queryParams);

        if (response.success && response.data.success) {
          // Thanh toán thành công - tạo đơn hàng
          const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
          
          if (pendingOrder.form) {
            const { form, buyNowData } = pendingOrder;
            
            let orderResponse;
            if (buyNowData) {
              orderResponse = await orderApi.checkoutDirect({
                diaChiGiaoHang: form.diaChiGiaoHang,
                phuongThucThanhToan: 'VNPay',
                voucherCode: pendingOrder.voucherCode,
                orderItems: buyNowData.map(item => ({
                  sanPhamChiTietId: item.sanPhamChiTiet?.sanPhamChiTietId || item.sanPhamChiTietId,
                  soLuong: item.soLuong,
                  donGia: item.giaBan
                }))
              });
            } else {
              orderResponse = await orderApi.checkout(form.diaChiGiaoHang, 'VNPay', pendingOrder.voucherCode, pendingOrder.gioHangChiTietIds);
            }

            if (orderResponse.success) {
              // Xóa pending order
              localStorage.removeItem('pendingOrder');
              
              // Refresh giỏ hàng nếu không phải mua ngay
              if (!buyNowData) {
                await refreshCart();
              }

              setPaymentResult({
                success: true,
                orderId: orderResponse.data?.donHangId,
                transactionId: response.data.transactionId
              });
              
              toast.success('Thanh toán thành công!');
            }
          }
        } else {
          // Thanh toán thất bại
          setPaymentResult({
            success: false,
            message: 'Thanh toán thất bại hoặc bị hủy'
          });
          
          toast.error('Thanh toán thất bại!');
          localStorage.removeItem('pendingOrder');
        }
      } catch (error) {
        console.error('Payment callback error:', error?.message || error);
        setPaymentResult({
          success: false,
          message: 'Có lỗi xảy ra khi xử lý thanh toán'
        });
        toast.error('Có lỗi xảy ra!');
      } finally {
        setProcessing(false);
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate, refreshCart]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 size={60} className="animate-spin text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xử lý thanh toán...</h2>
          <p className="text-gray-500">Vui lòng không tắt trình duyệt</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {paymentResult?.success ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-500 mb-6">Đơn hàng của bạn đã được xác nhận</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="text-xl font-bold text-gray-800">#{paymentResult.orderId}</p>
              {paymentResult.transactionId && (
                <>
                  <p className="text-sm text-gray-500 mt-2">Mã giao dịch</p>
                  <p className="text-lg font-semibold text-gray-700">{paymentResult.transactionId}</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-500 mb-6">{paymentResult?.message || 'Đã có lỗi xảy ra'}</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                Thử lại
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
