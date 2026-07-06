using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class DonHangChiTiet
    {
        public int DonHangChiTietId { get; set; }
        public int SoLuong { get; set; }
        public int DonGia { get; set; }

        public int DonHangId { get; set; }
        public DonHang DonHang { get; set; }

        public int SanPhamChiTietId { get; set; }
        public SanPhamChiTiet SanPhamChiTiet { get; set; }
    }
}
