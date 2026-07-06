namespace Application.DTOs.Requests
{
    public class UpdateSanPhamChiTietRequest
    {
        public string Size { get; set; } = string.Empty;
        public string MauSac { get; set; } = string.Empty;
        public int SoLuongTon { get; set; }
        public decimal GiaBan { get; set; }
        public string? HinhAnh { get; set; }
    }
}
