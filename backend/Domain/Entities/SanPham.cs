using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class SanPham
    {
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; }
        public string MoTa { get; set; }
        public decimal Gia { get; set; }
        public bool TrangThai { get; set; }
        public DateTime NgayTao { get; set; }
        public string? HinhAnh { get; set; }

        public int DanhMucId { get; set; }
        public DanhMuc DanhMuc { get; set; }

        public ICollection<SanPhamChiTiet> SanPhamChiTiets { get; set; }
        public ICollection<YeuThich> YeuThichs { get; set; }
    }
}
