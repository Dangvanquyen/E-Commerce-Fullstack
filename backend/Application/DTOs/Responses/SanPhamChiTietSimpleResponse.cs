namespace Application.DTOs.Responses
{
    public class SanPhamChiTietSimpleResponse
    {
        public int SanPhamChiTietId { get; set; }
        public string Size { get; set; } = string.Empty;
        public string MauSac { get; set; } = string.Empty;
        public int SoLuongTon { get; set; }
        public decimal GiaBan { get; set; }
        public string? HinhAnh { get; set; }
    }
}