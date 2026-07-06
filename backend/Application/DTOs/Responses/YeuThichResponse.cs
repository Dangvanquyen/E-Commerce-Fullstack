namespace Application.DTOs.Responses
{
    public class YeuThichResponse
    {
        public int YeuThichId { get; set; }
        public DateTime NgayThem { get; set; }
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }
        public decimal Gia { get; set; }
        public bool TrangThai { get; set; }
    }
}
