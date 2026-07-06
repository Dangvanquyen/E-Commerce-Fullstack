namespace Application.DTOs.Requests
{
    public class UpdateDanhMucRequest
    {
        public string TenDanhMuc { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
    }
}
