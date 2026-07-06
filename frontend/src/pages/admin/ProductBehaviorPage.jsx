import { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
    MousePointerClick, Clock, TrendingUp, Eye, Users,
    ShoppingBag, RefreshCw, Loader2, Calendar, Award
} from 'lucide-react';
import adminStatsApi from '../../api/adminStatsApi';

// Gradient màu cho bars
const BAR_COLORS = [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6',
    '#F59E0B', '#6366F1', '#84CC16', '#FB7185',
    '#34D399', '#60A5FA', '#A78BFA', '#FCD34D',
    '#4ADE80', '#38BDF8', '#C084FC', '#FB923C'
];

const formatTime = (giay) => {
    if (!giay || giay === 0) return '—';
    if (giay < 60) return `${Math.round(giay)}s`;
    const phut = Math.floor(giay / 60);
    const giayDu = Math.round(giay % 60);
    return giayDu > 0 ? `${phut}p ${giayDu}s` : `${phut} phút`;
};

const StatCard = ({ icon: Icon, label, value, sub, color, gradient }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient}`}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
            style={{ background: 'white' }} />
        <div className={`inline-flex p-3 rounded-xl bg-white/20 mb-4`}>
            <Icon size={24} />
        </div>
        <p className="text-white/80 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {sub && <p className="text-white/70 text-xs mt-1">{sub}</p>}
    </div>
);

const ProductBehaviorPage = () => {
    const today = new Date();
    const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString().split('T')[0];
    const defaultTo = today.toISOString().split('T')[0];

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [tuNgay, setTuNgay] = useState(defaultFrom);
    const [denNgay, setDenNgay] = useState(defaultTo);
    const [top, setTop] = useState(20);
    const [sortBy, setSortBy] = useState('soLuotClick'); // soLuotClick | thoiGianXemTBGiay | tiLeChuyen

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminStatsApi.getTopClickSanPham(tuNgay, denNgay, top);
            if (res?.success) {
                setData(res.data || []);
            }
        } catch (err) {
            console.error('Error fetching behavior data:', err);
        } finally {
            setLoading(false);
        }
    }, [tuNgay, denNgay, top]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const sorted = [...data].sort((a, b) => b[sortBy] - a[sortBy]);

    // Tổng hợp thống kê
    const tongClick = data.reduce((s, x) => s + x.soLuotClick, 0);
    const tongPhien = data.reduce((s, x) => s + x.soPhienXemDuyNhat, 0);
    const dataCoThoiGian = data.filter(x => x.thoiGianXemTBGiay > 0);
    const btThoiGian = dataCoThoiGian.length > 0
        ? dataCoThoiGian.reduce((s, x) => s + x.thoiGianXemTBGiay, 0) / dataCoThoiGian.length
        : 0;
    const topSanPham = data[0];

    // Chart data — top 10
    const chartData = sorted.slice(0, 10).map(item => ({
        name: item.tenSanPham.length > 12 ? item.tenSanPham.slice(0, 12) + '…' : item.tenSanPham,
        fullName: item.tenSanPham,
        soLuotClick: item.soLuotClick,
        thoiGianPhut: Math.round(item.thoiGianXemTBGiay / 60 * 10) / 10,
        tiLeChuyen: item.tiLeChuyen,
    }));

    const sortOptions = [
        { key: 'soLuotClick', label: 'Nhiều click nhất' },
        { key: 'thoiGianXemTBGiay', label: 'Xem lâu nhất' },
        { key: 'tiLeChuyen', label: 'Tỉ lệ mua cao nhất' },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        const item = payload[0]?.payload;
        return (
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 text-sm">
                <p className="font-bold text-gray-800 mb-2">{item?.fullName || label}</p>
                <p className="text-red-500">🖱️ Lượt click: <b>{item?.soLuotClick}</b></p>
                <p className="text-blue-500">⏱️ Xem TB: <b>{item?.thoiGianPhut} phút</b></p>
                <p className="text-green-500">📊 Tỉ lệ mua: <b>{item?.tiLeChuyen}%</b></p>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-purple-100 rounded-xl">
                        <MousePointerClick size={24} className="text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Hành Vi Duyệt Web Của Khách</h1>
                </div>
                <p className="text-gray-500 ml-14">
                    Theo dõi sản phẩm khách click, thời gian xem, và tỉ lệ mua hàng
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={tuNgay}
                            onChange={e => setTuNgay(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={denNgay}
                            onChange={e => setDenNgay(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Hiển thị top
                        </label>
                        <select
                            value={top}
                            onChange={e => setTop(Number(e.target.value))}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                            {[10, 20, 50, 100].map(n => (
                                <option key={n} value={n}>Top {n} sản phẩm</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                            Sắp xếp theo
                        </label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.key} value={opt.key}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
                    >
                        {loading
                            ? <Loader2 size={16} className="animate-spin" />
                            : <RefreshCw size={16} />}
                        Làm mới
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 size={44} className="animate-spin text-purple-500 mx-auto mb-3" />
                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                        <StatCard
                            icon={MousePointerClick}
                            label="Tổng lượt click"
                            value={tongClick.toLocaleString('vi-VN')}
                            sub={`${data.length} sản phẩm`}
                            gradient="bg-gradient-to-br from-red-500 to-rose-600"
                        />
                        <StatCard
                            icon={Users}
                            label="Phiên xem duy nhất"
                            value={tongPhien.toLocaleString('vi-VN')}
                            sub="Unique sessions"
                            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                        />
                        <StatCard
                            icon={Clock}
                            label="Thời gian xem TB"
                            value={formatTime(btThoiGian)}
                            sub="Trung bình tất cả SP"
                            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                        />
                        <StatCard
                            icon={Award}
                            label="SP được xem nhiều nhất"
                            value={topSanPham?.soLuotClick ? `${topSanPham.soLuotClick} lượt` : '—'}
                            sub={topSanPham?.tenSanPham?.slice(0, 22) || 'Chưa có dữ liệu'}
                            gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                        />
                    </div>

                    {/* Bar Chart — Top 10 */}
                    {chartData.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                                <TrendingUp size={20} className="text-purple-500" />
                                Top 10 sản phẩm được click nhiều nhất
                            </h2>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        angle={-35}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="soLuotClick" radius={[6, 6, 0, 0]} name="Lượt click">
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Detail Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Eye size={20} className="text-purple-500" />
                                Chi tiết hành vi theo sản phẩm
                                <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {sorted.length} sản phẩm
                                </span>
                            </h2>
                        </div>

                        {sorted.length === 0 ? (
                            <div className="py-20 text-center">
                                <MousePointerClick size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Chưa có dữ liệu tracking</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Dữ liệu sẽ xuất hiện khi khách hàng bắt đầu xem sản phẩm
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left px-5 py-4 font-semibold text-gray-600">#</th>
                                            <th className="text-left px-5 py-4 font-semibold text-gray-600">Sản phẩm</th>
                                            <th className="text-left px-5 py-4 font-semibold text-gray-600">Danh mục</th>
                                            <th className="text-center px-5 py-4 font-semibold text-gray-600">
                                                <div className="flex items-center justify-center gap-1">
                                                    <MousePointerClick size={14} /> Lượt click
                                                </div>
                                            </th>
                                            <th className="text-center px-5 py-4 font-semibold text-gray-600">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users size={14} /> Phiên duy nhất
                                                </div>
                                            </th>
                                            <th className="text-center px-5 py-4 font-semibold text-gray-600">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Clock size={14} /> Xem TB
                                                </div>
                                            </th>
                                            <th className="text-center px-5 py-4 font-semibold text-gray-600">
                                                <div className="flex items-center justify-center gap-1">
                                                    <ShoppingBag size={14} /> Đã bán
                                                </div>
                                            </th>
                                            <th className="text-center px-5 py-4 font-semibold text-gray-600">
                                                <div className="flex items-center justify-center gap-1">
                                                    <TrendingUp size={14} /> Tỉ lệ mua
                                                </div>
                                            </th>
                                            <th className="text-left px-5 py-4 font-semibold text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} /> Gần nhất
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {sorted.map((item, index) => {
                                            const convRate = item.tiLeChuyen;
                                            const convColor = convRate >= 10
                                                ? 'text-green-600 bg-green-50'
                                                : convRate >= 3
                                                    ? 'text-amber-600 bg-amber-50'
                                                    : 'text-red-500 bg-red-50';

                                            return (
                                                <tr key={item.sanPhamId}
                                                    className="hover:bg-purple-50/30 transition-colors group">
                                                    <td className="px-5 py-4">
                                                        {index < 3 ? (
                                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                                                                {index + 1}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">{index + 1}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.hinhAnh && (
                                                                <img
                                                                    src={item.hinhAnh}
                                                                    alt={item.tenSanPham}
                                                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                                                    onError={e => { e.target.style.display = 'none'; }}
                                                                />
                                                            )}
                                                            <span className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                                                {item.tenSanPham}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                            {item.tenDanhMuc}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                                            <MousePointerClick size={12} />
                                                            {item.soLuotClick.toLocaleString('vi-VN')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="text-blue-600 font-semibold">
                                                            {item.soPhienXemDuyNhat.toLocaleString('vi-VN')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full">
                                                            <Clock size={12} />
                                                            {formatTime(item.thoiGianXemTBGiay)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="text-gray-700 font-semibold">
                                                            {item.soLuongDaBan.toLocaleString('vi-VN')}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-xs ${convColor}`}>
                                                            {convRate.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-400 text-xs">
                                                        {item.lanClickGanNhat
                                                            ? new Date(item.lanClickGanNhat).toLocaleString('vi-VN', {
                                                                day: '2-digit', month: '2-digit',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })
                                                            : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                        <p className="font-semibold mb-1">💡 Giải thích chỉ số:</p>
                        <ul className="space-y-0.5 text-blue-600">
                            <li>• <b>Lượt click:</b> Tổng số lần khách vào trang chi tiết sản phẩm</li>
                            <li>• <b>Phiên duy nhất:</b> Số phiên trình duyệt khác nhau đã xem (loại trừ xem nhiều lần cùng 1 phiên)</li>
                            <li>• <b>Xem TB:</b> Thời gian trung bình khách ở lại trang sản phẩm</li>
                            <li>• <b>Tỉ lệ mua:</b> (Số sản phẩm đã bán / Tổng lượt click) × 100%</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductBehaviorPage;
