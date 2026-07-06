namespace Application.DTOs.Requests
{
    public class UpdateNguoiDungRequest
    {
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SoDienThoai { get; set; } = string.Empty;
        public string DiaChi { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public bool TrangThai { get; set; }
        public int VaiTroId { get; set; }
    }
}
