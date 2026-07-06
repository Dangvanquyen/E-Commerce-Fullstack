using System;

namespace Application.DTOs.Responses
{
    public class ThongBaoResponse
    {
        public int ThongBaoId { get; set; }
        public int? NguoiDungId { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public string LoaiThongBao { get; set; } = string.Empty;
        public string? LienKet { get; set; }
        public bool DaDoc { get; set; }
        public DateTime NgayTao { get; set; }
        public string ThoiGianTuongDoi { get; set; } = string.Empty;
    }
}
