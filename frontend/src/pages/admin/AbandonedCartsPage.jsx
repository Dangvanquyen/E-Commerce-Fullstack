import { useState, useEffect } from 'react';
import { Loader2, ShoppingCart, Package, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminCartApi from '../../api/adminCartApi';

const AbandonedCartsPage = () => {
    const [loading, setLoading] = useState(true);
    const [carts, setCarts] = useState([]);
    const [products, setProducts] = useState([]);
    const [expandedCart, setExpandedCart] = useState(null);
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [cartsRes, productsRes] = await Promise.all([
                    adminCartApi.getAbandonedCarts(),
                    adminCartApi.getAbandonedProducts()
                ]);
                setCarts(cartsRes.success ? cartsRes.data || [] : []);
                setProducts(productsRes.success ? productsRes.data || [] : []);
            } catch (error) {
                console.error('Error fetching abandoned carts:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const totalValue = carts.reduce((sum, c) => sum + (c.tongGiaTri || 0), 0);
    const chartData = products.slice(0, 10).map(p => ({
        name: p.tenSanPham.length > 20 ? p.tenSanPham.slice(0, 20) + '...' : p.tenSanPham,
        soLuong: p.soLuongTrongGio,
        soGio: p.soGioHang
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Giỏ hàng chưa mua</h1>
                <p className="text-gray-500">Sản phẩm khách thêm vào giỏ nhưng chưa thanh toán</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <ShoppingCart size={24} className="text-orange-600" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Giỏ hàng chưa mua</p>
                        <p className="text-2xl font-bold">{carts.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                        <Package size={24} className="text-red-600" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Sản phẩm trong giỏ</p>
                        <p className="text-2xl font-bold">{products.length}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Users size={24} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm">Tổng giá trị tiềm năng</p>
                        <p className="text-xl font-bold text-green-600">{formatPrice(totalValue)}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {[
                    { key: 'products', label: 'Theo sản phẩm' },
                    { key: 'carts', label: 'Theo giỏ hàng khách' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === tab.key ? 'bg-red-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'products' && (
                <>
                    {chartData.length > 0 && (
                        <div className="bg-white rounded-xl border p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Top sản phẩm trong giỏ chưa mua</h2>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="soLuong" fill="#EF4444" name="SL trong giỏ" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="bg-white rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-3">Sản phẩm</th>
                                    <th className="text-left px-4 py-3">Danh mục</th>
                                    <th className="text-right px-4 py-3">SL trong giỏ</th>
                                    <th className="text-right px-4 py-3">Số giỏ hàng</th>
                                    <th className="text-right px-4 py-3">Giá trị</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-gray-500">Không có sản phẩm nào trong giỏ chưa mua</td></tr>
                                ) : products.map(item => (
                                    <tr key={item.sanPhamId} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{item.tenSanPham}</td>
                                        <td className="px-4 py-3 text-gray-500">{item.tenDanhMuc}</td>
                                        <td className="px-4 py-3 text-right">{item.soLuongTrongGio}</td>
                                        <td className="px-4 py-3 text-right">{item.soGioHang}</td>
                                        <td className="px-4 py-3 text-right font-medium text-orange-600">{formatPrice(item.tongGiaTri)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'carts' && (
                <div className="space-y-4">
                    {carts.length === 0 ? (
                        <div className="bg-white rounded-xl border p-10 text-center text-gray-500">
                            Không có giỏ hàng nào chưa mua
                        </div>
                    ) : carts.map(cart => (
                        <div key={cart.gioHangId} className="bg-white rounded-xl border overflow-hidden">
                            <button
                                onClick={() => setExpandedCart(expandedCart === cart.gioHangId ? null : cart.gioHangId)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                                        {cart.hoTen?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{cart.hoTen}</p>
                                        <p className="text-sm text-gray-500">{cart.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm text-gray-500">{cart.tongSoSanPham} sản phẩm</p>
                                        <p className="font-bold text-orange-600">{formatPrice(cart.tongGiaTri)}</p>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <p className="text-xs text-gray-400">Thêm giỏ lúc</p>
                                        <p className="text-sm text-gray-600">{formatDate(cart.ngayTao)}</p>
                                    </div>
                                    {expandedCart === cart.gioHangId
                                        ? <ChevronUp size={20} className="text-gray-400" />
                                        : <ChevronDown size={20} className="text-gray-400" />}
                                </div>
                            </button>

                            {expandedCart === cart.gioHangId && (
                                <div className="border-t px-4 pb-4">
                                    <table className="w-full text-sm mt-2">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-3 py-2">Sản phẩm</th>
                                                <th className="text-left px-3 py-2">Phân loại</th>
                                                <th className="text-right px-3 py-2">SL</th>
                                                <th className="text-right px-3 py-2">Đơn giá</th>
                                                <th className="text-right px-3 py-2">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {cart.chiTiets?.map(item => (
                                                <tr key={item.gioHangChiTietId}>
                                                    <td className="px-3 py-2">{item.tenSanPham}</td>
                                                    <td className="px-3 py-2 text-gray-500">{item.size} / {item.mauSac}</td>
                                                    <td className="px-3 py-2 text-right">{item.soLuong}</td>
                                                    <td className="px-3 py-2 text-right">{formatPrice(item.donGia)}</td>
                                                    <td className="px-3 py-2 text-right font-medium">{formatPrice(item.thanhTien)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AbandonedCartsPage;
