namespace Application.DTOs.Responses
{
    public class SanPhamChiTietResponse
    {
        public int SanPhamChiTietId { get; set; }
        public string Size { get; set; } = string.Empty;
        public string MauSac { get; set; } = string.Empty;
        public int SoLuongTon { get; set; }
        public decimal GiaBan { get; set; }
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string TenDanhMuc { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
    }
}
