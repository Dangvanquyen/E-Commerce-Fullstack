import { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loader2, TrendingUp, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import adminStatsApi from '../../api/adminStatsApi';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const ReportsPage = () => {
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [year, setYear] = useState(currentYear);
    const [periodData, setPeriodData] = useState([]);
    const [productData, setProductData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const tuNgay = `${year}-01-01`;
            const denNgay = `${year}-12-31`;

            const [periodRes, productRes, categoryRes] = await Promise.all([
                period === 'month'
                    ? adminStatsApi.getDoanhThuTheoThang(year)
                    : period === 'quarter'
                    ? adminStatsApi.getDoanhThuTheoQuy(year)
                    : adminStatsApi.getDoanhThuTheoNam(year - 4, year),
                adminStatsApi.getDoanhThuTheoSanPham(tuNgay, denNgay, 15),
                adminStatsApi.getDoanhThuTheoDanhMuc(tuNgay, denNgay)
            ]);

            setPeriodData(periodRes.success ? periodRes.data || [] : []);
            setProductData(productRes.success ? productRes.data || [] : []);
            setCategoryData(categoryRes.success ? categoryRes.data || [] : []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    }, [period, year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartPeriodData = periodData.map(item => ({
        ...item,
        doanhThuTrieu: item.doanhThu / 1000000
    }));

    const totalRevenue = periodData.reduce((sum, item) => sum + (item.doanhThu || 0), 0);
    const totalOrders = periodData.reduce((sum, item) => sum + (item.soDonHang || 0), 0);

    const exportExcel = () => {
        const wb = XLSX.utils.book_new();

        const periodSheet = periodData.map(item => ({
            'Kỳ': item.ky,
            'Số đơn hàng': item.soDonHang,
            'Doanh thu (VNĐ)': item.doanhThu
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(periodSheet), 'Doanh thu theo kỳ');

        const productSheet = productData.map(item => ({
            'Sản phẩm': item.tenSanPham,
            'Danh mục': item.tenDanhMuc,
            'SL bán': item.soLuongBan,
            'Doanh thu (VNĐ)': item.doanhThu
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productSheet), 'Theo sản phẩm');

        const categorySheet = categoryData.map(item => ({
            'Danh mục': item.tenDanhMuc,
            'SL bán': item.soLuongBan,
            'Doanh thu (VNĐ)': item.doanhThu
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categorySheet), 'Theo danh mục');

        XLSX.writeFile(wb, `bao-cao-doanh-thu-${year}.xlsx`);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`BÁO CÁO DOANH THU - ${year}`, 105, 20, { align: 'center' });

        autoTable(doc, {
            startY: 30,
            head: [['Kỳ', 'Số đơn', 'Doanh thu']],
            body: periodData.map(item => [
                item.ky,
                item.soDonHang,
                formatPrice(item.doanhThu)
            ])
        });

        doc.save(`bao-cao-doanh-thu-${year}.pdf`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu</h1>
                    <p className="text-gray-500">Thống kê theo tháng, quý, năm, sản phẩm và danh mục</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                        <Download size={16} /> PDF
                    </button>
                    <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Download size={16} /> Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex gap-2">
                    {[
                        { key: 'month', label: 'Theo tháng' },
                        { key: 'quarter', label: 'Theo quý' },
                        { key: 'year', label: 'Theo năm' }
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => setPeriod(opt.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                period === opt.key
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                {period !== 'year' && (
                    <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl border p-5">
                    <p className="text-gray-500 text-sm">Tổng doanh thu ({period === 'month' ? `năm ${year}` : period === 'quarter' ? `năm ${year}` : '5 năm gần nhất'})</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl border p-5">
                    <p className="text-gray-500 text-sm">Tổng đơn hoàn thành</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{totalOrders} đơn</p>
                </div>
            </div>

            {/* Period chart */}
            <div className="bg-white rounded-xl border p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-red-600" />
                    Doanh thu theo {period === 'month' ? 'tháng' : period === 'quarter' ? 'quý' : 'năm'}
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartPeriodData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ky" />
                        <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                        <Tooltip formatter={(value, name) =>
                            name === 'Doanh thu (triệu)' ? [`${value.toFixed(2)} triệu`, name] : [value, name]
                        } />
                        <Legend />
                        <Bar yAxisId="left" dataKey="soDonHang" fill="#3B82F6" name="Số đơn" />
                        <Bar yAxisId="right" dataKey="doanhThuTrieu" fill="#10B981" name="Doanh thu (triệu)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* By category pie */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Doanh thu theo danh mục</h2>
                    {categoryData.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">Chưa có dữ liệu</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={categoryData.map(c => ({ name: c.tenDanhMuc, value: c.doanhThu }))}
                                    cx="50%" cy="50%"
                                    outerRadius={90}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => formatPrice(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category table */}
                <div className="bg-white rounded-xl border p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Chi tiết theo danh mục</h2>
                    <div className="overflow-x-auto max-h-72 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="text-left px-3 py-2">Danh mục</th>
                                    <th className="text-right px-3 py-2">SL bán</th>
                                    <th className="text-right px-3 py-2">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {categoryData.map(item => (
                                    <tr key={item.danhMucId} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">{item.tenDanhMuc}</td>
                                        <td className="px-3 py-2 text-right">{item.soLuongBan}</td>
                                        <td className="px-3 py-2 text-right font-medium text-green-600">{formatPrice(item.doanhThu)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* By product table */}
            <div className="bg-white rounded-xl border p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Top sản phẩm bán chạy (năm {year})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-3">#</th>
                                <th className="text-left px-4 py-3">Sản phẩm</th>
                                <th className="text-left px-4 py-3">Danh mục</th>
                                <th className="text-right px-4 py-3">SL bán</th>
                                <th className="text-right px-4 py-3">Doanh thu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {productData.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Chưa có dữ liệu</td></tr>
                            ) : productData.map((item, index) => (
                                <tr key={item.sanPhamId} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium">{item.tenSanPham}</td>
                                    <td className="px-4 py-3 text-gray-500">{item.tenDanhMuc}</td>
                                    <td className="px-4 py-3 text-right">{item.soLuongBan}</td>
                                    <td className="px-4 py-3 text-right font-medium text-green-600">{formatPrice(item.doanhThu)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
