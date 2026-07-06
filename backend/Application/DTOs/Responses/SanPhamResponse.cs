namespace Application.DTOs.Responses
{
    public class SanPhamResponse
    {
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public decimal Gia { get; set; }
        public string? HinhAnh { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public int DanhMucId { get; set; }
        public string DanhMucTen { get; set; } = string.Empty;
        public IEnumerable<SanPhamChiTietSimpleResponse> SanPhamChiTiets { get; set; } = new List<SanPhamChiTietSimpleResponse>();
    }
}
