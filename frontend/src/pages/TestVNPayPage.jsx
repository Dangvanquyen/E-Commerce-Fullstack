import { useState } from 'react';
import { toast } from 'react-toastify';
import paymentApi from '../api/paymentApi';

const TestVNPayPage = () => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  const testPayment = async () => {
    try {
      setLoading(true);
      
      const testData = {
        orderType: 'billpayment',
        amount: 100000, // 100,000 VND
        orderDescription: 'Test thanh toan',
        name: 'Nguyen Van A'
      };

      const response = await paymentApi.createVnPayUrl(testData);
      
      if (response.success) {
        setPaymentUrl(response.data);
        toast.success('Tạo URL thành công!');
        
        // Log để debug
        console.log('Payment URL:', response.data);
        
        // Tự động mở trong tab mới
        window.open(response.data, '_blank');
      } else {
        toast.error('Không thể tạo URL thanh toán');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Test VNPay Payment</h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Thông tin cấu hình:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• TmnCode: VZEOUUKT</li>
                <li>• HashSecret: WURJ84U5JR5XLZIQPD1AT1V330OHYGET</li>
                <li>• Amount: 100,000 VND</li>
                <li>• Order Type: billpayment</li>
              </ul>
            </div>

            <button
              onClick={testPayment}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 transition"
            >
              {loading ? 'Đang tạo URL...' : 'Test Thanh Toán VNPay'}
            </button>

            {paymentUrl && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2">Payment URL:</h3>
                <div className="bg-white p-3 rounded border break-all text-sm">
                  {paymentUrl}
                </div>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-blue-600 hover:underline"
                >
                  Mở trong tab mới →
                </a>
              </div>
            )}

            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-900 mb-2">⚠️ Lưu ý:</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Nếu hiện "Không tìm thấy website" → TmnCode sai hoặc chưa kích hoạt</li>
                <li>• Kiểm tra lại email đăng ký VNPay Sandbox</li>
                <li>• Đảm bảo đã kích hoạt tài khoản tại sandbox.vnpayment.vn</li>
                <li>• Mở Console (F12) để xem log chi tiết</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-900 mb-2">💳 Thẻ test:</h3>
              <div className="text-sm text-green-800 space-y-1">
                <p>• Ngân hàng: <strong>NCB</strong></p>
                <p>• Số thẻ: <strong>9704198526191432198</strong></p>
                <p>• Tên chủ thẻ: <strong>NGUYEN VAN A</strong></p>
                <p>• Ngày phát hành: <strong>07/15</strong></p>
                <p>• Mật khẩu OTP: <strong>123456</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestVNPayPage;
