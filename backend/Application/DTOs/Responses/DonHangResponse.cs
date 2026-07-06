namespace Application.DTOs.Responses
{
    public class DonHangResponse
    {
        public int DonHangId { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string DiaChiGiaoHang { get; set; } = string.Empty;
        public DateTime NgayDat { get; set; }
        public int NguoiDungId { get; set; }
        public string TenNguoiDung { get; set; } = string.Empty;
        public int? MaGiamGiaId { get; set; }
        public string VoucherCode { get; set; } = string.Empty;
        public decimal TienGiam { get; set; }
        public IEnumerable<DonHangChiTietResponse> ChiTiets { get; set; } = Enumerable.Empty<DonHangChiTietResponse>();
        public ThanhToanResponse? ThanhToan { get; set; }
    }
}
