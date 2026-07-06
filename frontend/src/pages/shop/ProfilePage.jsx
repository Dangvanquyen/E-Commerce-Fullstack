import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Package, Clock, CheckCircle, XCircle, Truck, Loader2, LogOut, ChevronRight, Lock, Headphones } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import orderApi from '../../api/orderApi';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelingId, setCancelingId] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Hàm lấy dữ liệu từ chi tiết đơn hàng
  const getItemData = (item) => {
    return {
      name: item.tenSanPham || "Sản phẩm không xác định",
      image: item.hinhAnh || 'https://placehold.co/150x150?text=No+Image',
      price: item.donGia || 0,
      color: item.mauSac || "Không xác định",
      size: item.size || "Không xác định",
      quantity: item.soLuong || 1
    };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      console.log('ProfilePage - fetchOrders called:', { isAuthenticated, user });
      
      if (!isAuthenticated) {
        console.log('ProfilePage - Not authenticated, redirecting to login');
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        console.log('ProfilePage - Fetching orders...');
        const response = await orderApi.getMyOrders();
        console.log('ProfilePage - Orders response:', response);
        
        if (response.success) {
          const sortedOrders = (response.data || []).sort((a, b) => new Date(b.ngayDat) - new Date(a.ngayDat));
          setOrders(sortedOrders);
          console.log('ProfilePage - Orders set:', sortedOrders);
        } else {
          console.error('ProfilePage - Orders fetch failed:', response.message);
          toast.error(response.message || 'Không thể tải danh sách đơn hàng');
        }
      } catch (error) {
        console.error('ProfilePage - Error fetching orders:', error);
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
          logout();
          navigate('/login');
        } else {
          toast.error('Không thể tải danh sách đơn hàng');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, navigate, logout]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

    try {
      setCancelingId(orderId);
      const response = await orderApi.cancelOrder(orderId); 
      
      if (response.success) {
        toast.success("Đã hủy đơn hàng thành công");
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.donHangId === orderId ? { ...order, trangThai: 'DaHuy' } : order
          )
        );
      } else {
        toast.error(response.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error("Lỗi khi hủy đơn hàng");
    } finally {
      setCancelingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
        <Link to="/login" className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ChoXuLy': return { label: 'Chờ xử lý', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Clock };
      case 'DangGiao': return { label: 'Đang giao', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Truck };
      case 'HoanThanh': return { label: 'Hoàn thành', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle };
      case 'DaHuy': return { label: 'Đã hủy', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle };
      default: return { label: status, color: 'text-gray-700 bg-gray-50 border-gray-200', icon: Package };
    }
  };

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(order => order.trangThai === activeTab);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'ChoXuLy', label: 'Chờ xử lý' },
    { id: 'DangGiao', label: 'Đang giao' },
    { id: 'HoanThanh', label: 'Hoàn thành' },
    { id: 'DaHuy', label: 'Đã hủy' }
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- SIDEBAR --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md overflow-hidden">
                <User size={40} className="text-gray-400" />
              </div>
              <h2 className="font-bold text-xl text-gray-900">{user?.hoTen || 'Khách hàng'}</h2>
              <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
            </div>

            <div className="space-y-1">
              <button className="w-full p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 font-semibold transition">
                <Package size={20} /> Đơn hàng của tôi
              </button>
              <Link to="/profile/settings" className="w-full p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium transition">
                <User size={20} /> Thông tin tài khoản
              </Link>
              <Link to="/cham-soc-khach-hang" className="w-full p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium transition">
                <Headphones size={20} /> Chăm sóc khách hàng
              </Link>
              <Link to="/profile/change-password" className="w-full p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium transition">
                <Lock size={20} /> Đổi mật khẩu
              </Link>
              <button onClick={handleLogout} className="w-full p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium transition text-left">
                <LogOut size={20} /> Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                    activeTab === tab.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 size={40} className="animate-spin text-red-600 mb-4" />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Chưa có đơn hàng nào</h3>
                  <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition mt-4">
                    Mua sắm ngay <ChevronRight size={18} />
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const status = getStatusInfo(order.trangThai);
                  const StatusIcon = status.icon;

                  return (
                    <div key={order.donHangId} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                      
                      {/* 1. Header Đơn Hàng */}
                      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-gray-900">#{order.donHangId}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-gray-500">{formatDate(order.ngayDat)}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                          <StatusIcon size={14} />
                          {status.label}
                        </div>
                      </div>

                      {/* 2. Body: Danh sách sản phẩm */}
                      <div className="p-6">
                        <div className="space-y-4">
                          {order.chiTiets?.map((item) => {
                            const data = getItemData(item);
                            return (
                              <div key={item.donHangChiTietId} className="flex gap-4 items-start">
                                <div className="w-20 h-20 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                                  <img 
                                    src={data.image} 
                                    alt={data.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150?text=No+Image'; }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-1">{data.name}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{data.color}</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{data.size}</span>
                                    <span>x{data.quantity}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-gray-900">{formatPrice(data.price * data.quantity)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Footer: Tổng tiền & Hành động */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                        <div>
                          <span className="text-gray-500 text-sm mr-2">Tổng tiền:</span>
                          <span className="text-2xl font-bold text-red-600">{formatPrice(order.tongTien)}</span>
                        </div>

                        <div className="w-full sm:w-auto mt-2 sm:mt-0">
                          {order.trangThai === 'ChoXuLy' && (
                            <button 
                              onClick={() => handleCancelOrder(order.donHangId)}
                              disabled={cancelingId === order.donHangId}
                              className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {cancelingId === order.donHangId ? (
                                <>
                                  <Loader2 className="animate-spin" size={20} /> Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <XCircle size={20} /> Hủy đơn hàng
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;