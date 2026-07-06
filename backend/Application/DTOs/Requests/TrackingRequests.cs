using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Requests
{
    public class GhiNhanClickRequest
    {
        [Required]
        public int SanPhamId { get; set; }

        /// <summary>Null nếu chưa đăng nhập</summary>
        public int? NguoiDungId { get; set; }

        /// <summary>UUID session được sinh từ frontend</summary>
        [Required]
        public string SessionId { get; set; } = string.Empty;

        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }
    }

    public class CapNhatThoiGianXemRequest
    {
        [Required]
        public long LichSuId { get; set; }

        /// <summary>Số giây đã xem</summary>
        [Required]
        [Range(0, 86400)]
        public int Giay { get; set; }
    }
}
