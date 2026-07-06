namespace Application.DTOs.Responses
{
    public class GioHangResponse
    {
        public int GioHangId { get; set; }
        public DateTime NgayTao { get; set; }
        public int NguoiDungId { get; set; }
        public IEnumerable<GioHangChiTietResponse> ChiTiets { get; set; } = Enumerable.Empty<GioHangChiTietResponse>();
        public decimal TongTien { get; set; }
    }
}
