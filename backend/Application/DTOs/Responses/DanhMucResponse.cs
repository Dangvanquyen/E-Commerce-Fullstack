namespace Application.DTOs.Responses
{
    public class DanhMucResponse
    {
        public int DanhMucId { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        public bool TrangThai { get; set; }
    }
}
