using System.Collections.Generic;

namespace Application.DTOs.Requests
{
    public class CreateDonHangRequest
    {
        public string DiaChiGiaoHang { get; set; } = string.Empty;
        public string PhuongThucThanhToan { get; set; } = string.Empty;
        public string? VoucherCode { get; set; }
        public List<int>? GioHangChiTietIds { get; set; }
    }
}
