namespace Application.DTOs.Responses
{
    public class DonHangChiTietResponse
    {
        public int DonHangChiTietId { get; set; }
        public int SoLuong { get; set; }
        public int DonGia { get; set; }
        public int SanPhamChiTietId { get; set; }
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
        public string Size { get; set; } = string.Empty;
        public string MauSac { get; set; } = string.Empty;
        public decimal ThanhTien { get; set; }
    }
}
