using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class GioHangChiTiet
    {
        public int GioHangChiTietId { get; set; }
        public int SoLuong { get; set; }

        public int GioHangId { get; set; }
        public GioHang GioHang { get; set; }

        public int SanPhamChiTietId { get; set; }
        public SanPhamChiTiet SanPhamChiTiet { get; set; }
    }
}
