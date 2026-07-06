using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;

namespace Application.Services
{
    public class ThongKeService : IThongKeService
    {
        private readonly IThongKeRepository _thongKeRepository;

        public ThongKeService(IThongKeRepository thongKeRepository)
        {
            _thongKeRepository = thongKeRepository;
        }

        public Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoThangAsync(int nam)
            => _thongKeRepository.GetDoanhThuTheoThangAsync(nam);

        public Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoQuyAsync(int nam)
            => _thongKeRepository.GetDoanhThuTheoQuyAsync(nam);

        public Task<IEnumerable<DoanhThuKyResponse>> GetDoanhThuTheoNamAsync(int tuNam, int denNam)
            => _thongKeRepository.GetDoanhThuTheoNamAsync(tuNam, denNam);

        public Task<IEnumerable<DoanhThuSanPhamResponse>> GetDoanhThuTheoSanPhamAsync(
            DateTime? tuNgay, DateTime? denNgay, int top = 20)
            => _thongKeRepository.GetDoanhThuTheoSanPhamAsync(tuNgay, denNgay, top);

        public Task<IEnumerable<DoanhThuDanhMucResponse>> GetDoanhThuTheoDanhMucAsync(
            DateTime? tuNgay, DateTime? denNgay)
            => _thongKeRepository.GetDoanhThuTheoDanhMucAsync(tuNgay, denNgay);

        public Task<ThongKeTongQuanResponse> GetTongQuanAsync()
            => _thongKeRepository.GetTongQuanAsync();

        // --- Tracking hành vi duyệt web ---
        public Task<long> GhiNhanClickAsync(GhiNhanClickRequest request)
            => _thongKeRepository.GhiNhanClickAsync(request);

        public Task CapNhatThoiGianXemAsync(long lichSuId, int giay)
            => _thongKeRepository.CapNhatThoiGianXemAsync(lichSuId, giay);

        public Task<IEnumerable<ThongKeClickSanPhamResponse>> GetTopClickSanPhamAsync(
            DateTime? tuNgay, DateTime? denNgay, int top)
            => _thongKeRepository.GetTopClickSanPhamAsync(tuNgay, denNgay, top);
    }
}
