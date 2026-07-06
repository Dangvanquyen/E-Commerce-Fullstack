namespace Application.DTOs.Responses
{
    public class ThanhToanResponse
    {
        public int ThanhToanId { get; set; }
        public string PhuongThuc { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? NgayThanhToan { get; set; }
        public int DonHangId { get; set; }
    }
}
