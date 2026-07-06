namespace Application.DTOs.Requests
{
    public class CreateSanPhamRequest
    {
        public string TenSanPham { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public decimal Gia { get; set; }
        public string? HinhAnh { get; set; }
        public int DanhMucId { get; set; }
    }
}
