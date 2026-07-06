using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using Domain.Entities;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ThongKeRepository : IThongKeRepository
    {
        private readonly AppDbContext _context;
        private const string TrangThaiHoanThanh = "HoanThanh";

        public ThongKeRepository(AppDbContext context)
        {
            _context = context;
        }

        private IQueryable<DonHangChiTiet> CompletedOrderDetailsQuery(DateTime? tuNgay, DateTime? denNgay)
        {
            var query = _context.DonHangChiTiet
                .Include(ct => ct.DonHang)
                .Include(ct => ct.SanPhamChiTiet)
                    .ThenInclude(sp => sp.SanPham)
                        .ThenInclude(p => p.DanhMuc)
                .Where(ct => ct.DonHang.TrangThai == TrangThaiHoanThanh);

            if (tuNgay.HasValue)
                query = query.Where(ct => ct.DonHang.NgayDat >= tuNgay.Value);

            if (denNgay.HasValue)
                query = query.Where(ct => ct.DonHang.NgayDat <= denNgay.Value);

            return query;
        }

        public async Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoThangAsync(int nam)
        {
            var tuNgay = new DateTime(nam, 1, 1);
            var denNgay = new DateTime(nam, 12, 31, 23, 59, 59);

            var orders = await _context.DonHang
                .Where(d => d.TrangThai == TrangThaiHoanThanh && d.NgayDat >= tuNgay && d.NgayDat <= denNgay)
                .ToListAsync();

            return Enumerable.Range(1, 12).Select(thang =>
            {
                var donThang = orders.Where(d => d.NgayDat.Month == thang).ToList();
                return new DoanhThuKyResponse
                {
                    Ky = $"T{thang}/{nam}",
                    SoDonHang = donThang.Count,
                    DoanhThu = donThang.Sum(d => d.TongTien)
                };
            });
        }

        public async Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoQuyAsync(int nam)
        {
            var tuNgay = new DateTime(nam, 1, 1);
            var denNgay = new DateTime(nam, 12, 31, 23, 59, 59);

            var orders = await _context.DonHang
                .Where(d => d.TrangThai == TrangThaiHoanThanh && d.NgayDat >= tuNgay && d.NgayDat <= denNgay)
                .ToListAsync();

            return Enumerable.Range(1, 4).Select(quy =>
            {
                var donQuy = orders.Where(d => (d.NgayDat.Month - 1) / 3 + 1 == quy).ToList();
                return new DoanhThuKyResponse
                {
                    Ky = $"Q{quy}/{nam}",
                    SoDonHang = donQuy.Count,
                    DoanhThu = donQuy.Sum(d => d.TongTien)
                };
            });
        }

        public async Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoNamAsync(int tuNam, int denNam)
        {
            var tuNgay = new DateTime(tuNam, 1, 1);
            var denNgay = new DateTime(denNam, 12, 31, 23, 59, 59);

            var orders = await _context.DonHang
                .Where(d => d.TrangThai == TrangThaiHoanThanh && d.NgayDat >= tuNgay && d.NgayDat <= denNgay)
                .ToListAsync();

            return Enumerable.Range(tuNam, denNam - tuNam + 1).Select(nam =>
            {
                var donNam = orders.Where(d => d.NgayDat.Year == nam).ToList();
                return new DoanhThuKyResponse
                {
                    Ky = nam.ToString(),
                    SoDonHang = donNam.Count,
                    DoanhThu = donNam.Sum(d => d.TongTien)
                };
            });
        }

        public async Task<IEnumerable<DoanhThuSanPhamResponse>> GetDoanhThuTheoSanPhamAsync(
            DateTime? tuNgay, DateTime? denNgay, int top = 20)
        {
            var details = await CompletedOrderDetailsQuery(tuNgay, denNgay).ToListAsync();

            return details
                .GroupBy(ct => new
                {
                    ct.SanPhamChiTiet.SanPham.SanPhamId,
                    ct.SanPhamChiTiet.SanPham.TenSanPham,
                    ct.SanPhamChiTiet.SanPham.DanhMucId,
                    TenDanhMuc = ct.SanPhamChiTiet.SanPham.DanhMuc?.TenDanhMuc ?? "Khác"
                })
                .Select(g => new DoanhThuSanPhamResponse
                {
                    SanPhamId = g.Key.SanPhamId,
                    TenSanPham = g.Key.TenSanPham,
                    DanhMucId = g.Key.DanhMucId,
                    TenDanhMuc = g.Key.TenDanhMuc,
                    SoLuongBan = g.Sum(x => x.SoLuong),
                    DoanhThu = g.Sum(x => (decimal)x.SoLuong * x.DonGia)
                })
                .OrderByDescending(x => x.DoanhThu)
                .Take(top)
                .ToList();
        }

        public async Task<IEnumerable<DoanhThuDanhMucResponse>> GetDoanhThuTheoDanhMucAsync(
            DateTime? tuNgay, DateTime? denNgay)
        {
            var details = await CompletedOrderDetailsQuery(tuNgay, denNgay).ToListAsync();

            return details
                .GroupBy(ct => new
                {
                    DanhMucId = ct.SanPhamChiTiet.SanPham.DanhMuc?.DanhMucId ?? 0,
                    TenDanhMuc = ct.SanPhamChiTiet.SanPham.DanhMuc?.TenDanhMuc ?? "Khác"
                })
                .Select(g => new DoanhThuDanhMucResponse
                {
                    DanhMucId = g.Key.DanhMucId,
                    TenDanhMuc = g.Key.TenDanhMuc,
                    SoLuongBan = g.Sum(x => x.SoLuong),
                    DoanhThu = g.Sum(x => (decimal)x.SoLuong * x.DonGia)
                })
                .OrderByDescending(x => x.DoanhThu)
                .ToList();
        }

        public async Task<ThongKeTongQuanResponse> GetTongQuanAsync()
        {
            var orders = await _context.DonHang.ToListAsync();
            var gioHangs = await _context.GioHang
                .Include(g => g.GioHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                .Where(g => g.GioHangChiTiets.Any())
                .ToListAsync();

            var giaTriGio = gioHangs.Sum(g =>
                g.GioHangChiTiets.Sum(c => (decimal)c.SoLuong * c.SanPhamChiTiet.GiaBan));

            return new ThongKeTongQuanResponse
            {
                TongDoanhThu = orders.Where(d => d.TrangThai == TrangThaiHoanThanh).Sum(d => d.TongTien),
                TongDonHang = orders.Count,
                DonHangHoanThanh = orders.Count(d => d.TrangThai == TrangThaiHoanThanh),
                DonHangChoXuLy = orders.Count(d => d.TrangThai == "ChoXuLy"),
                GioHangChuaMua = gioHangs.Count,
                GiaTriGioHangChuaMua = giaTriGio
            };
        }

        // =========================================================
        // TRACKING HÀNH VI DUYỆT WEB
        // =========================================================

        public async Task<long> GhiNhanClickAsync(GhiNhanClickRequest request)
        {
            var lichSu = new LichSuXemSanPham
            {
                SanPhamId = request.SanPhamId,
                NguoiDungId = request.NguoiDungId,
                SessionId = request.SessionId,
                ThoiGianVao = DateTime.UtcNow,
                ThoiGianXemGiay = 0,
                IPAddress = request.IPAddress,
                UserAgent = request.UserAgent
            };

            _context.LichSuXemSanPham.Add(lichSu);
            await _context.SaveChangesAsync();
            return lichSu.LichSuId;
        }

        public async Task CapNhatThoiGianXemAsync(long lichSuId, int giay)
        {
            var record = await _context.LichSuXemSanPham.FindAsync(lichSuId);
            if (record == null) return;

            record.ThoiGianRoi = DateTime.UtcNow;
            record.ThoiGianXemGiay = giay > 0 ? giay : 0;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ThongKeClickSanPhamResponse>> GetTopClickSanPhamAsync(
            DateTime? tuNgay, DateTime? denNgay, int top)
        {
            // Lấy dữ liệu tracking
            var query = _context.LichSuXemSanPham
                .Include(x => x.SanPham)
                    .ThenInclude(sp => sp.DanhMuc)
                .AsQueryable();

            if (tuNgay.HasValue)
                query = query.Where(x => x.ThoiGianVao >= tuNgay.Value);
            if (denNgay.HasValue)
                query = query.Where(x => x.ThoiGianVao <= denNgay.Value.AddDays(1));

            var lichSuList = await query.ToListAsync();

            // Lấy dữ liệu bán hàng để tính tỉ lệ chuyển đổi
            var tuNgayBan = tuNgay;
            var denNgayBan = denNgay;
            var banHangQuery = _context.DonHangChiTiet
                .Include(ct => ct.DonHang)
                .Include(ct => ct.SanPhamChiTiet)
                .Where(ct => ct.DonHang.TrangThai == TrangThaiHoanThanh);

            if (tuNgayBan.HasValue)
                banHangQuery = banHangQuery.Where(ct => ct.DonHang.NgayDat >= tuNgayBan.Value);
            if (denNgayBan.HasValue)
                banHangQuery = banHangQuery.Where(ct => ct.DonHang.NgayDat <= denNgayBan.Value.AddDays(1));

            var banHangList = await banHangQuery.ToListAsync();

            // Số lượng bán theo SanPhamId
            var soLuongBanBySanPham = banHangList
                .GroupBy(ct => ct.SanPhamChiTiet.SanPhamId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.SoLuong));

            // Group theo sản phẩm
            var result = lichSuList
                .GroupBy(x => new
                {
                    x.SanPhamId,
                    x.SanPham.TenSanPham,
                    TenDanhMuc = x.SanPham.DanhMuc?.TenDanhMuc ?? "Khác",
                    x.SanPham.HinhAnh
                })
                .Select(g =>
                {
                    var daThoiGian = g.Where(x => x.ThoiGianXemGiay > 0).ToList();
                    return new ThongKeClickSanPhamResponse
                    {
                        SanPhamId = g.Key.SanPhamId,
                        TenSanPham = g.Key.TenSanPham,
                        TenDanhMuc = g.Key.TenDanhMuc,
                        HinhAnh = g.Key.HinhAnh,
                        SoLuotClick = g.Count(),
                        SoPhienXemDuyNhat = g.Select(x => x.SessionId).Distinct().Count(),
                        ThoiGianXemTBGiay = daThoiGian.Any()
                            ? daThoiGian.Average(x => x.ThoiGianXemGiay)
                            : 0,
                        SoLuongDaBan = soLuongBanBySanPham.TryGetValue(g.Key.SanPhamId, out var sl) ? sl : 0,
                        LanClickGanNhat = g.Max(x => x.ThoiGianVao)
                    };
                })
                .OrderByDescending(x => x.SoLuotClick)
                .Take(top)
                .ToList();

            return result;
        }
    }
}
