import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ShoppingCart,
    DollarSign,
    Clock,
    TrendingUp,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import adminOrderApi from '../../api/adminOrderApi';
import adminProductApi from '../../api/adminProductApi';

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrdersToday: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [chartData, setChartData] = useState({
        dailyOrders: [],
        orderStatus: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch orders
                const ordersResponse = await adminOrderApi.getAll();
                const orders = ordersResponse.success ? ordersResponse.data : [];

                // Fetch products
                const productsResponse = await adminProductApi.getAll();
                const products = productsResponse.success ? productsResponse.data : [];

                // Calculate stats
                const today = new Date().toDateString();
                const todayOrders = orders.filter(o =>
                    new Date(o.ngayDat).toDateString() === today
                );

                const pendingOrders = orders.filter(o => o.trangThai === 'ChoXuLy');
                const totalRevenue = orders
                    .filter(o => o.trangThai === 'HoanThanh')
                    .reduce((sum, o) => sum + (o.tongTien || 0), 0);

                setStats({
                    totalOrdersToday: todayOrders.length,
                    totalRevenue,
                    pendingOrders: pendingOrders.length,
                    totalProducts: products.length
                });

                // Get recent orders (top 5)
                setRecentOrders(orders.slice(0, 5));

                // Prepare chart data - Đơn hàng theo ngày (7 ngày gần nhất)
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    
                    const dayOrders = orders.filter(o => {
                        const orderDate = new Date(o.ngayDat);
                        return orderDate.toDateString() === date.toDateString();
                    });

                    const dayRevenue = dayOrders
                        .filter(o => o.trangThai === 'HoanThanh')
                        .reduce((sum, o) => sum + (o.tongTien || 0), 0);

                    last7Days.push({
                        date: dateStr,
                        orders: dayOrders.length,
                        revenue: dayRevenue / 1000000 // Chuyển sang triệu đồng
                    });
                }

                // Prepare pie chart data - Trạng thái đơn hàng
                const statusCount = {
                    'ChoXuLy': 0,
                    'DangGiao': 0,
                    'HoanThanh': 0,
                    'DaHuy': 0
                };

                orders.forEach(order => {
                    if (statusCount.hasOwnProperty(order.trangThai)) {
                        statusCount[order.trangThai]++;
                    }
                });

                const pieData = [
                    { name: 'Chờ duyệt', value: statusCount.ChoXuLy, color: '#EAB308' },
                    { name: 'Đang giao', value: statusCount.DangGiao, color: '#3B82F6' },
                    { name: 'Hoàn thành', value: statusCount.HoanThanh, color: '#10B981' },
                    { name: 'Đã hủy', value: statusCount.DaHuy, color: '#EF4444' }
                ].filter(item => item.value > 0); // Chỉ hiển thị trạng thái có đơn

                setChartData({
                    dailyOrders: last7Days,
                    orderStatus: pieData
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            
            // Title
            doc.setFontSize(18);
            doc.setTextColor(40, 116, 166);
            doc.text('BAO CAO DOANH THU THEO NGAY', 105, 20, { align: 'center' });
            
            // Date
            doc.setFontSize(11);
            doc.setTextColor(100);
            const today = new Date().toLocaleDateString('vi-VN');
            doc.text(`Ngay xuat bao cao: ${today}`, 105, 30, { align: 'center' });
            
            // Table - Daily Orders
            const tableData = chartData.dailyOrders.map(item => [
                item.date,
                item.orders.toString(),
                (item.revenue * 1000000).toLocaleString('vi-VN') + ' d'
            ]);
            
            autoTable(doc, {
                startY: 40,
                head: [['Ky Bao Cao', 'So Don Hang', 'Doanh Thu']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontSize: 11,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 10,
                    halign: 'center'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });
            
            // Summary
            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(12);
            doc.setTextColor(0);
            
            const totalRevenue = chartData.dailyOrders.reduce((sum, item) => sum + item.revenue, 0) * 1000000;
            const totalOrders = chartData.dailyOrders.reduce((sum, item) => sum + item.orders, 0);
            
            doc.text(`Tong doanh thu: ${totalRevenue.toLocaleString('vi-VN')} d`, 20, finalY);
            doc.text(`Tong so don: ${totalOrders} don`, 20, finalY + 10);
            
            // Save
            doc.save(`bao-cao-doanh-thu-${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Loi khi xuat PDF: ' + error.message);
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        try {
            // Prepare data
            const excelData = chartData.dailyOrders.map(item => ({
                'Kỳ Báo Cáo': item.date,
                'Số Đơn Hàng': item.orders,
                'Doanh Thu (VNĐ)': (item.revenue * 1000000).toLocaleString('vi-VN')
            }));
            
            // Add summary row
            const totalRevenue = chartData.dailyOrders.reduce((sum, item) => sum + item.revenue, 0) * 1000000;
            const totalOrders = chartData.dailyOrders.reduce((sum, item) => sum + item.orders, 0);
            
            excelData.push({});
            excelData.push({
                'Kỳ Báo Cáo': 'TỔNG CỘNG',
                'Số Đơn Hàng': totalOrders,
                'Doanh Thu (VNĐ)': totalRevenue.toLocaleString('vi-VN')
            });
            
            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            ws['!cols'] = [
                { wch: 15 },
                { wch: 15 },
                { wch: 20 }
            ];
            
            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Doanh Thu');
            
            // Save
            XLSX.writeFile(wb, `bao-cao-doanh-thu-${new Date().getTime()}.xlsx`);
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Lỗi khi xuất Excel: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'ChoXuLy': 'bg-yellow-100 text-yellow-800',
            'DangGiao': 'bg-blue-100 text-blue-800',
            'HoanThanh': 'bg-green-100 text-green-800',
            'DaHuy': 'bg-red-100 text-red-800'
        };
        const labels = {
            'ChoXuLy': 'Chờ duyệt',
            'DangGiao': 'Đang giao',
            'HoanThanh': 'Hoàn thành',
            'DaHuy': 'Đã hủy'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-red-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Đơn hàng hôm nay',
            value: stats.totalOrdersToday,
            icon: ShoppingCart,
            color: 'bg-blue-500',
            change: '+12%',
            positive: true
        },
        {
            title: 'Doanh thu',
            value: formatPrice(stats.totalRevenue),
            icon: DollarSign,
            color: 'bg-green-500',
            change: '+8%',
            positive: true
        },
        {
            title: 'Đơn chờ duyệt',
            value: stats.pendingOrders,
            icon: Clock,
            color: 'bg-yellow-500',
            change: stats.pendingOrders > 0 ? 'Cần xử lý' : 'Tốt',
            positive: stats.pendingOrders === 0
        },
        {
            title: 'Sản phẩm',
            value: stats.totalProducts,
            icon: Package,
            color: 'bg-purple-500',
            change: 'Tổng số',
            positive: true
        }
    ];

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Tổng quan về cửa hàng của bạn</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        <Package size={18} />
                        Xuất PDF
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <TrendingUp size={18} />
                        Xuất Excel
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${card.color}`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <span className={`flex items-center text-sm font-medium
                  ${card.positive ? 'text-green-600' : 'text-red-600'}`}>
                                    {card.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {card.change}
                                </span>
                            </div>
                            <h3 className="text-gray-500 text-sm mb-1">{card.title}</h3>
                            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
                {/* Bar Chart - Đơn hàng theo ngày - 70% width */}
                <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Thống kê 7 ngày gần đây</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.dailyOrders}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                            <Tooltip 
                                formatter={(value, name) => {
                                    if (name === 'Số đơn') return [value, name];
                                    return [value.toFixed(2) + ' triệu', name];
                                }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Số đơn" />
                            <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Doanh thu (triệu)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart - Trạng thái đơn hàng - 30% width */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData.orderStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.orderStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                        {chartData.orderStatus.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Đơn hàng gần đây</h2>
                    <Link to="/admin/orders" className="text-red-600 text-sm font-medium hover:underline">
                        Xem tất cả
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Chưa có đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.donHangId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Link to={`/admin/orders/${order.donHangId}`} className="text-red-600 font-medium hover:underline">
                                                #{order.donHangId}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-800">
                                            {order.nguoiDung?.hoTen || 'Khách hàng'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm">
                                            {formatDate(order.ngayDat)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {formatPrice(order.tongTien)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.trangThai)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
