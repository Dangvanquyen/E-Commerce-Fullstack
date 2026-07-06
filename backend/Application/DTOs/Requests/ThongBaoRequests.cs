using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Requests
{
    public class CreateThongBaoRequest
    {
        public int? NguoiDungId { get; set; }

        [Required]
        [MaxLength(150)]
        public string TieuDe { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string NoiDung { get; set; } = string.Empty;

        public string LoaiThongBao { get; set; } = "HeThong";

        public string? LienKet { get; set; }
    }
}
