using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class SanPhamChiTiet
    {
        public int SanPhamChiTietId { get; set; }
        public string Size { get; set; }
        public string MauSac { get; set; }
        public int SoLuongTon { get; set; }
        public decimal GiaBan { get; set; }
        public string? HinhAnh { get; set; }

        public int SanPhamId { get; set; }
        public SanPham SanPham { get; set; }

        public ICollection<GioHangChiTiet> GioHangChiTiets { get; set; }
        public ICollection<DonHangChiTiet> DonHangChiTiets { get; set; }
    }
}
