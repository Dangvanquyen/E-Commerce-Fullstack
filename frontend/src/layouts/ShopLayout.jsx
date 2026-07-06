import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut, Package, ChevronDown, Heart, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useChat } from '../context/ChatContext';
import notificationApi from '../api/notificationApi';
import productApi from '../api/productApi';
import { removeVietnameseTones } from '../utils/vietnamese';

const ShopLayout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const { unreadCount = 0 } = useChat();
  
  // State quản lý hiển thị
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State quản lý thông báo gợi ý tìm kiếm sản phẩm
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // State quản lý thông báo
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Fetch sản phẩm active khi mở ô tìm kiếm
  useEffect(() => {
    if (searchOpen && products.length === 0) {
      const fetchProducts = async () => {
        try {
          setLoadingSuggestions(true);
          const res = await productApi.getActive();
          if (res.success) {
            setProducts(res.data || []);
          }
        } catch (err) {
          console.error("Lỗi khi tải sản phẩm gợi ý:", err);
        } finally {
          setLoadingSuggestions(false);
        }
      };
      fetchProducts();
    }
  }, [searchOpen, products.length]);

  // Lọc gợi ý khi thay đổi từ khóa
  useEffect(() => {
    const queryTrimmed = searchQuery.trim();
    if (!queryTrimmed) {
      setSuggestions([]);
      return;
    }
    const queryNormalized = removeVietnameseTones(queryTrimmed).toLowerCase();
    const filtered = products.filter(p => {
      const nameNormalized = removeVietnameseTones(p.tenSanPham || '').toLowerCase();
      const descNormalized = removeVietnameseTones(p.moTa || '').toLowerCase();
      return nameNormalized.includes(queryNormalized) || descNormalized.includes(queryNormalized);
    });
    setSuggestions(filtered.slice(0, 5));
  }, [searchQuery, products]);

  // Polling thông báo của user
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const countRes = await notificationApi.getUnreadCount();
        setUnreadNotificationCount(countRes.data || 0);

        const listRes = await notificationApi.getNotifications(10);
        setNotifications(listRes.data || []);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setNotificationOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchQuery.trim();
    if (keyword) {
      navigate(`/shop?search=${encodeURIComponent(keyword)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleMarkAsRead = async (id, lienKet) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => notif.thongBaoId === id ? { ...notif, daDoc: true } : notif)
      );
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      setNotificationOpen(false);
      if (lienKet) {
        navigate(lienKet);
      }
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc:", err);
      setNotificationOpen(false);
      if (lienKet) navigate(lienKet);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, daDoc: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error("Lỗi khi đánh dấu đọc tất cả:", err);
    }
  };

  // Class chung cho link menu để code gọn hơn
  const navLinkClass = "text-gray-800 hover:text-red-600 transition-colors duration-300 font-semibold tracking-wide flex items-center gap-1 h-20 premium-underline text-[14px]";
  const dropdownClass = "absolute top-full left-0 w-52 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-gray-100/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 z-50 p-2 overflow-hidden";
  const dropdownItemClass = "block px-4 py-2.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-sm font-semibold text-gray-600 transition-all duration-200";

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 glassmorphism shadow-sm transition-all duration-300">
        {(userMenuOpen || searchOpen || notificationOpen) && (
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => { setUserMenuOpen(false); setSearchOpen(false); setNotificationOpen(false); }} />
        )}
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 hover:text-red-600 transition-colors duration-300 flex items-center gap-0.5 group">
            FASHION<span className="text-red-600 font-light tracking-wide group-hover:translate-x-0.5 transition-transform duration-300">STORE</span>
          </Link>

          {/* MENU CHÍNH (DESKTOP) */}
          <nav className="hidden md:flex gap-8">
            <Link to="/" className={navLinkClass}>Trang chủ</Link>
            <Link to="/shop" className={navLinkClass}>Sản phẩm</Link>

            {/* Dropdown NAM */}
            <div className="group relative cursor-pointer">
              <span className={navLinkClass}>Nam <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" /></span>
              <div className={dropdownClass}>
                <Link to="/shop?category=Áo Nam" className={dropdownItemClass} onClick={() => setMobileMenuOpen(false)}>Áo Nam</Link>
                <Link to="/shop?category=Quần Nam" className={dropdownItemClass} onClick={() => setMobileMenuOpen(false)}>Quần Nam</Link>
              </div>
            </div>

            {/* Dropdown NỮ */}
            <div className="group relative cursor-pointer">
              <span className={navLinkClass}>Nữ <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" /></span>
              <div className={dropdownClass}>
                <Link to="/shop?category=Áo nữ" className={dropdownItemClass} onClick={() => setMobileMenuOpen(false)}>Áo Nữ</Link>
                <Link to="/shop?category=Quần nữ" className={dropdownItemClass} onClick={() => setMobileMenuOpen(false)}>Quần Nữ</Link>
              </div>
            </div>

            <Link to="/shop?category=Phụ kiện" className={navLinkClass}>Phụ kiện</Link>
            <Link to="/wishlist" className={navLinkClass}>Yêu thích</Link>
            <Link to="/cham-soc-khach-hang" className={navLinkClass}>Hỗ trợ</Link>
          </nav>

          {/* ICON BUTTONS */}
          <div className="flex items-center space-x-3 md:space-x-4">
            {/* Search */}
            <div className="relative">
              <button onClick={() => setSearchOpen(!searchOpen)} className="hover:text-red-600 hover:scale-110 active:scale-95 transition-all p-2 rounded-full hover:bg-gray-50">
                <Search size={20} className="md:w-[22px] md:h-[22px]" />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 transition-all duration-300 animate-fade-in-up">
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600/25 focus:border-red-600 transition duration-300 text-sm"
                      autoFocus
                    />
                  </form>
                  
                  {/* Gợi ý tìm kiếm */}
                  {searchQuery.trim() && (
                    <div className="mt-3 border-t pt-3 max-h-80 overflow-y-auto">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-xs font-semibold text-gray-400">Sản phẩm gợi ý</span>
                        {loadingSuggestions && (
                          <span className="text-xs text-red-600 animate-pulse">Đang tải...</span>
                        )}
                      </div>
                      
                      {suggestions.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2 px-1 text-center">Không tìm thấy sản phẩm nào</p>
                      ) : (
                        <div className="space-y-1">
                          {suggestions.map((product) => (
                            <Link
                              key={product.sanPhamId}
                              to={`/product/${product.sanPhamId}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-red-50/40 rounded-lg transition-all duration-200 transform hover:translate-x-1"
                            >
                              <div className="w-12 h-12 rounded-md overflow-hidden border shrink-0 bg-gray-50">
                                <img
                                  src={product.hinhAnh || 'https://via.placeholder.com/400x400?text=No+Image'}
                                  alt={product.tenSanPham}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate hover:text-red-600 transition">
                                  {product.tenSanPham}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-red-600 font-bold">
                                    {new Intl.NumberFormat('vi-VN').format(product.gia)} đ
                                  </span>
                                  {product.giaGoc && product.giaGoc > product.gia && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {new Intl.NumberFormat('vi-VN').format(product.giaGoc)} đ
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                          
                          <Link
                            to={`/shop?search=${encodeURIComponent(searchQuery.trim())}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center justify-center gap-1 text-center text-xs text-red-600 hover:text-red-700 hover:underline font-bold pt-2 border-t mt-2 transition"
                          >
                            Xem tất cả kết quả cho "{searchQuery.trim()}" &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Account */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                   <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 hover:scale-105 active:scale-95 transition-all p-1 rounded-full hover:bg-gray-50">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.hoTen} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-red-500 shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=U'; }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center text-white text-xs font-black shadow-md">
                        {user?.hoTen?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in-up">
                      <div className="px-3 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs font-semibold text-gray-400">Xin chào</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{user?.hoTen || 'Khách hàng'}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <Package size={16} /> Đơn hàng của tôi
                      </Link>
                      <Link to="/profile/settings" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                        <User size={16} /> Thông tin tài khoản
                      </Link>
                      <hr className="my-1.5 border-gray-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-200 text-left">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="hover:text-red-600 hover:scale-110 active:scale-95 transition-all p-2 rounded-full hover:bg-gray-50 block"><User size={20} className="md:w-[22px] md:h-[22px]" /></Link>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  if (isAuthenticated) {
                    setNotificationOpen(!notificationOpen);
                    setUserMenuOpen(false);
                    setSearchOpen(false);
                  } else {
                    navigate('/login');
                  }
                }} 
                className="relative hover:text-red-600 hover:scale-110 active:scale-95 transition-all p-2 rounded-full hover:bg-gray-50 block"
              >
                <Bell size={20} className="md:w-[22px] md:h-[22px]" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-extrabold ring-2 ring-white animate-pulse">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationOpen && isAuthenticated && (
                <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-fade-in-up">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base">Thông báo của bạn</h3>
                    {unreadNotificationCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead} 
                        className="text-xs text-red-600 hover:underline font-bold"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto mt-1 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-400 text-sm">
                        Hộp thư thông báo đang trống.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.thongBaoId}
                          onClick={() => handleMarkAsRead(notif.thongBaoId, notif.lienKet)}
                          className={`px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 flex items-start gap-3 ${!notif.daDoc ? 'bg-red-50/20' : ''}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {!notif.daDoc && <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-ping"></span>}
                              <p className="text-xs font-bold text-gray-900">{notif.tieuDe}</p>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{notif.noiDung}</p>
                            <p className="text-[9px] text-gray-400 mt-1.5">{notif.thoiGianTuongDoi || new Date(notif.ngayTao).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative hover:text-red-600 hover:scale-110 active:scale-95 transition-all p-2 rounded-full hover:bg-gray-50 block">
              <Heart size={20} className="md:w-[22px] md:h-[22px]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-extrabold ring-2 ring-white animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative hover:text-red-600 hover:scale-110 active:scale-95 transition-all p-2 rounded-full hover:bg-gray-50 block">
              <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center font-extrabold ring-2 ring-white animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU (Giản lược để gọn file) */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg">
             <Link to="/" className="block font-medium" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
             <Link to="/shop" className="block font-medium" onClick={() => setMobileMenuOpen(false)}>Tất cả sản phẩm</Link>
             <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <p className="text-sm text-gray-400 font-bold uppercase">Nam</p>
                <Link to="/shop?category=Áo Nam" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Áo Nam</Link>
                <Link to="/shop?category=Quần Nam" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Quần Nam</Link>
             </div>
             <div className="pl-4 border-l-2 border-gray-100 space-y-3">
                <p className="text-sm text-gray-400 font-bold uppercase">Nữ</p>
                <Link to="/shop?category=Áo Nữ" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Áo Nữ</Link>
                <Link to="/shop?category=Quần Nữ" className="block text-gray-600" onClick={() => setMobileMenuOpen(false)}>Quần Nữ</Link>
                
             </div>
             <Link to="/shop?category=Phụ kiện" className="block font-medium" onClick={() => setMobileMenuOpen(false)}>Phụ kiện</Link>
             <Link to="/cham-soc-khach-hang" className="block font-medium" onClick={() => setMobileMenuOpen(false)}>Hỗ trợ khách hàng</Link>
          </div>
        )}
      </header>



      {/* --- CONTENT --- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 text-gray-300 pt-16 pb-8 border-t border-slate-900 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <h3 className="font-black text-2xl tracking-tighter text-white">FASHION<span className="text-red-600 font-light tracking-wide">STORE</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed">Shop ттα - Nơi định hình phong cách thời trang tinh tế, tối giản nhưng đầy khí chất của bạn.</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wider uppercase">Mua sắm</h4>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <Link to="/shop?categories=Quần Nam,Áo Nam" className="hover:text-red-500 hover:translate-x-1 transition-all duration-300">Thời trang Nam</Link>
              <Link to="/shop?categories=Quần Nữ,Áo Nữ" className="hover:text-red-500 hover:translate-x-1 transition-all duration-300">Thời trang Nữ</Link>
              <Link to="/shop?categories=Phụ kiện" className="hover:text-red-500 hover:translate-x-1 transition-all duration-300">Phụ kiện thời thượng</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white text-base mb-4 tracking-wider uppercase">Dịch vụ & Hỗ trợ</h4>
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <Link to="/cham-soc-khach-hang" className="hover:text-red-500 hover:translate-x-1 transition-all duration-300">Trung tâm trợ giúp</Link>
              <Link to="#" className="hover:text-red-500 hover:translate-x-1 transition-all duration-300">Chính sách giao nhận & đổi trả</Link>
              <Link to="/profile" className="hover:text-red-500 hover:translate-x-1 transition-all duration-300">Tra cứu vận đơn</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-white text-base mb-2 tracking-wider uppercase">Đăng ký nhận tin</h4>
            <p className="text-gray-400 text-xs leading-relaxed">Đăng ký để nhận sớm nhất thông báo về các bộ sưu tập mới và mã ưu đãi độc quyền.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Đăng ký nhận ưu đãi thành công!"); }} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                required
                className="bg-slate-900 border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-red-600 transition-all duration-300 flex-1 min-w-0"
              />
              <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2.5 rounded-lg font-bold transition-all duration-300 shine-effect shrink-0">
                Gửi
              </button>
            </form>
          </div>
        </div>
        <div className="text-center text-gray-600 text-xs border-t border-slate-900 mt-12 pt-6">
          © 2026 FashionStore. Bản quyền được bảo lưu bởi nhóm phát triển.
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;  