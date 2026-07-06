namespace Application.DTOs.Responses
{
    public class NguoiDungResponse
    {
        public int NguoiDungId { get; set; }
        public string TenDangNhap { get; set; } = string.Empty;
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public string VaiTroTen { get; set; } = string.Empty;
    }
}
