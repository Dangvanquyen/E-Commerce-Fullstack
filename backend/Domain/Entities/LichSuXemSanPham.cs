using System;

namespace Domain.Entities
{
    public class LichSuXemSanPham
    {
        public long LichSuId { get; set; }

        /// <summary>Sản phẩm được xem</summary>
        public int SanPhamId { get; set; }
        public SanPham SanPham { get; set; } = null!;

        /// <summary>Người dùng đã đăng nhập (null nếu là khách)</summary>
        public int? NguoiDungId { get; set; }
        public NguoiDung? NguoiDung { get; set; }

        /// <summary>Session ID (UUID) để phân biệt phiên ẩn danh</summary>
        public string SessionId { get; set; } = string.Empty;

        /// <summary>Thời điểm bắt đầu xem</summary>
        public DateTime ThoiGianVao { get; set; }

        /// <summary>Thời điểm rời trang (null nếu chưa cập nhật)</summary>
        public DateTime? ThoiGianRoi { get; set; }

        /// <summary>Tổng thời gian xem tính bằng giây</summary>
        public int ThoiGianXemGiay { get; set; }

        /// <summary>Địa chỉ IP của khách</summary>
        public string? IPAddress { get; set; }

        /// <summary>User Agent trình duyệt</summary>
        public string? UserAgent { get; set; }
    }
}
