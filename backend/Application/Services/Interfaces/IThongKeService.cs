using Application.DTOs.Requests;
using Application.DTOs.Responses;

namespace Application.Services.Interfaces
{
    public interface IThongKeRepository
    {
        Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoThangAsync(int nam);
        Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoQuyAsync(int nam);
        Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoNamAsync(int tuNam, int denNam);
        Task<IEnumerable<DoanhThuSanPhamResponse>> GetDoanhThuTheoSanPhamAsync(DateTime? tuNgay, DateTime? denNgay, int top = 20);
        Task<IEnumerable<DoanhThuDanhMucResponse>> GetDoanhThuTheoDanhMucAsync(DateTime? tuNgay, DateTime? denNgay);
        Task<ThongKeTongQuanResponse> GetTongQuanAsync();

        // --- Tracking hành vi duyệt web ---
        Task<long> GhiNhanClickAsync(GhiNhanClickRequest request);
        Task CapNhatThoiGianXemAsync(long lichSuId, int giay);
        Task<IEnumerable<ThongKeClickSanPhamResponse>> GetTopClickSanPhamAsync(DateTime? tuNgay, DateTime? denNgay, int top);
    }

    public interface IThongKeService
    {
        Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoThangAsync(int nam);
        Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoQuyAsync(int nam);
        Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoNamAsync(int tuNam, int denNam);
        Task<IEnumerable<DoanhThuSanPhamResponse>> GetDoanhThuTheoSanPhamAsync(DateTime? tuNgay, DateTime? denNgay, int top = 20);
        Task<IEnumerable<DoanhThuDanhMucResponse>> GetDoanhThuTheoDanhMucAsync(DateTime? tuNgay, DateTime? denNgay);
        Task<ThongKeTongQuanResponse> GetTongQuanAsync();

        // --- Tracking hành vi duyệt web ---
        Task<long> GhiNhanClickAsync(GhiNhanClickRequest request);
        Task CapNhatThoiGianXemAsync(long lichSuId, int giay);
        Task<IEnumerable<ThongKeClickSanPhamResponse>> GetTopClickSanPhamAsync(DateTime? tuNgay, DateTime? denNgay, int top);
    }
}

