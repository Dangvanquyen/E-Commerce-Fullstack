import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const BankingQRCode = ({ amount, orderInfo, onClose }) => {
    const [copied, setCopied] = useState(false);

    // Thông tin ngân hàng
    const bankInfo = {
        bankName: 'Ngan hang quan doi',
        bankCode: 'MB Bank',
        accountNumber: '0862118502',
        accountName: 'TRAN CONG DANH'
    };

    // Tạo nội dung chuyển khoản
    const transferContent = orderInfo || 'Thanh toan don hang';
    
    // Format số tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    // Tạo URL QR Code sử dụng API VietQR
    const qrCodeUrl = `https://img.vietqr.io/image/MB-0862118502-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=TRAN%20CONG%20DANH`;
    // Copy số tài khoản
    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`Đã copy ${label}!`);
        setTimeout(() => setCopied(false), 2000);
    };

    // Download QR Code
    const downloadQR = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QR-${orderInfo}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Đã tải QR Code!');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-800">Chuyển khoản ngân hàng</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* QR Code */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="w-full h-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/300x300?text=QR+Code';
                                }}
                            />
                        </div>
                        <p className="text-center text-sm text-gray-600 mt-4">
                            Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                        </p>
                        <button
                            onClick={downloadQR}
                            className="w-full mt-3 py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Tải QR Code
                        </button>
                    </div>

                    {/* Thông tin chuyển khoản */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-800 text-lg">Thông tin chuyển khoản</h3>
                        
                        {/* Ngân hàng */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Ngân hàng</p>
                                    <p className="font-bold text-gray-800">{bankInfo.bankName} ({bankInfo.bankCode})</p>
                                </div>
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{bankInfo.bankCode}</span>
                                </div>
                            </div>
                        </div>

                        {/* Số tài khoản */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Số tài khoản</p>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-gray-800 text-lg">{bankInfo.accountNumber}</p>
                                <button
                                    onClick={() => copyToClipboard(bankInfo.accountNumber, 'số tài khoản')}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition"
                                >
                                    {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} className="text-gray-600" />}
                                </button>
                            </div>
                        </div>

                        {/* Chủ tài khoản */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-1">Chủ tài khoản</p>
                            <p className="font-bold text-gray-800">{bankInfo.accountName}</p>
                        </div>

                        {/* Số tiền */}
                        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                            <p className="text-sm text-gray-500 mb-1">Số tiền</p>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-red-600 text-2xl">{formatPrice(amount)} đ</p>
                                <button
                                    onClick={() => copyToClipboard(amount.toString(), 'số tiền')}
                                    className="p-2 hover:bg-red-100 rounded-lg transition"
                                >
                                    {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} className="text-red-600" />}
                                </button>
                            </div>
                        </div>

                        {/* Nội dung chuyển khoản */}
                        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                            <p className="text-sm text-gray-500 mb-1">Nội dung chuyển khoản</p>
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-gray-800">{transferContent}</p>
                                <button
                                    onClick={() => copyToClipboard(transferContent, 'nội dung')}
                                    className="p-2 hover:bg-yellow-100 rounded-lg transition"
                                >
                                    {copied ? <CheckCircle size={20} className="text-green-600" /> : <Copy size={20} className="text-yellow-600" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lưu ý */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-sm text-blue-800 font-medium mb-2">📌 Lưu ý quan trọng:</p>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Vui lòng chuyển <strong>ĐÚNG số tiền</strong> và <strong>nội dung</strong></li>
                            <li>Đơn hàng sẽ được xử lý sau khi nhận được thanh toán</li>
                            <li>Thời gian xử lý: 5-10 phút</li>
                            <li>Liên hệ hotline nếu cần hỗ trợ: 1900 123 456</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-gray-900 transition"
                    >
                        Đã chuyển khoản
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BankingQRCode;
