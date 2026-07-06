namespace Application.DTOs.Responses
{
    public class GioHangChiTietResponse
    {
        public int GioHangChiTietId { get; set; }
        public int SoLuong { get; set; }
        public int SanPhamChiTietId { get; set; }
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
        public string Size { get; set; } = string.Empty;
        public string MauSac { get; set; } = string.Empty;
        public decimal GiaBan { get; set; }
        public decimal ThanhTien { get; set; }
    }
}
