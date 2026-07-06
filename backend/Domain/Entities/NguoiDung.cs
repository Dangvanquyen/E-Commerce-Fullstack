using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class NguoiDung
    {
        public int NguoiDungId { get; set; }
        public string TenDangNhap { get; set; }
        public string MatKhau { get; set; }
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public string DiaChi { get; set; }
        public string? Avatar { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }

        public int VaiTroId { get; set; }
        public VaiTro VaiTro { get; set; }

        public GioHang GioHang { get; set; }
        public ICollection<DonHang> DonHangs { get; set; }
        public ICollection<YeuThich> YeuThichs { get; set; }
    }
}
