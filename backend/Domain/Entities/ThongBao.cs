using System;

namespace Domain.Entities
{
    public class ThongBao
    {
        public int ThongBaoId { get; set; }
        
        /// <summary>
        /// ID người dùng nhận thông báo. 
        /// Nếu Null, đây là thông báo gửi đến hệ thống Admin hoặc thông báo chung.
        /// </summary>
        public int? NguoiDungId { get; set; }
        
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        
        /// <summary>
        /// Phân loại: "DonHang" | "HeThong" | "KhuyenMai"
        /// </summary>
        public string LoaiThongBao { get; set; } = "HeThong";
        
        /// <summary>
        /// Đường dẫn liên kết khi nhấn vào thông báo (ví dụ: "/profile" hoặc "/admin/orders/1")
        /// </summary>
        public string? LienKet { get; set; }
        
        public bool DaDoc { get; set; } = false;
        public DateTime NgayTao { get; set; } = DateTime.Now;

        // Navigation properties
        public NguoiDung? NguoiDung { get; set; }
    }
}
