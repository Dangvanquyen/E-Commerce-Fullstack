import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Bell,
    BarChart3,
    ShoppingBag,
    MessageCircle,
    MousePointerClick,
    Ticket,
    Boxes
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import chatApi from '../api/chatApi';
import notificationApi from '../api/notificationApi';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/categories', icon: FolderTree, label: 'Danh mục' },
        { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
        { path: '/admin/inventory', icon: Boxes, label: 'Kho hàng' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
        { path: '/admin/reports', icon: BarChart3, label: 'Báo cáo' },
        { path: '/admin/abandoned-carts', icon: ShoppingBag, label: 'Giỏ chưa mua' },
        { path: '/admin/product-behavior', icon: MousePointerClick, label: 'Hành vi KH' },
        { path: '/admin/users', icon: Users, label: 'Người dùng' },
        { path: '/admin/vouchers', icon: Ticket, label: 'Mã giảm giá' },
        { path: '/admin/chat', icon: MessageCircle, label: 'Chat' },
    ];

    const isActive = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    useEffect(() => {
        const isAdmin = user?.vaiTro?.tenVaiTro === 'Admin' || user?.vaiTro === 'Admin';
        if (!isAdmin) {
            setNotificationCount(0);
            setNotifications([]);
            return;
        }

        const loadAdminNotifications = async () => {
            try {
                const countRes = await notificationApi.getUnreadCount();
                setNotificationCount(countRes.data || 0);

                const listRes = await notificationApi.getAdminNotifications(10);
                setNotifications(listRes.data || []);
            } catch (error) {
                console.error('Failed to load admin notifications:', error);
            }
        };

        loadAdminNotifications();
        const poller = setInterval(loadAdminNotifications, 10000);

        return () => clearInterval(poller);
    }, [user, location.pathname]);

    const handleMarkAsRead = async (id, lienKet) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => 
                prev.map(notif => notif.thongBaoId === id ? { ...notif, daDoc: true } : notif)
            );
            setNotificationCount(prev => Math.max(0, prev - 1));
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
            setNotificationCount(0);
        } catch (err) {
            console.error("Lỗi khi đánh dấu đọc tất cả:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar - Desktop */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-slate-900 transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'} hidden md:block`}>

                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                    {sidebarOpen && (
                        <Link to="/admin" className="text-xl font-bold text-white">
                            Fashion<span className="text-red-500">Admin</span>
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path, item.exact);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition
                  ${active
                                        ? 'bg-red-600 text-white'
                                        : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-red-400 transition"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900">
                        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
                            <span className="text-xl font-bold text-white">
                                Fashion<span className="text-red-500">Admin</span>
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <nav className="mt-6 px-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path, item.exact);

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition
                      ${active
                                                ? 'bg-red-600 text-white'
                                                : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                {/* Top header - Fixed */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    {notificationOpen && (
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setNotificationOpen(false)} />
                    )}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
                            Quản trị hệ thống
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setNotificationOpen(!notificationOpen)}
                                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <Bell size={20} className="text-gray-600" />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-semibold">
                                        {notificationCount > 99 ? '99+' : notificationCount}
                                    </span>
                                )}
                            </button>

                            {notificationOpen && (
                                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border py-2 z-50 text-left">
                                    <div className="flex items-center justify-between px-4 py-2 border-b">
                                        <h3 className="font-bold text-gray-800">Thông báo</h3>
                                        {notificationCount > 0 && (
                                            <button 
                                                onClick={handleMarkAllAsRead} 
                                                className="text-xs text-red-600 hover:underline font-medium"
                                            >
                                                Đánh dấu tất cả đã đọc
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                                Không có thông báo nào.
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div 
                                                    key={notif.thongBaoId}
                                                    onClick={() => handleMarkAsRead(notif.thongBaoId, notif.lienKet)}
                                                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition flex items-start gap-3 ${!notif.daDoc ? 'bg-red-50/40' : ''}`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            {!notif.daDoc && <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>}
                                                            <p className="text-sm font-semibold text-gray-900">{notif.tieuDe}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-1">{notif.noiDung}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{notif.thoiGianTuongDoi || new Date(notif.ngayTao).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User menu */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {user?.hoTen?.charAt(0) || 'A'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-800">{user?.hoTen || 'Admin'}</p>
                                <p className="text-xs text-gray-500">{user?.vaiTro?.tenVaiTro || user?.vaiTro || 'Administrator'}</p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
