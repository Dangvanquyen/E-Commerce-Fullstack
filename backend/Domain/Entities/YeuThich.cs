using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class YeuThich
    {
        public int YeuThichId { get; set; }
        public DateTime NgayThem { get; set; }

        public int NguoiDungId { get; set; }
        public NguoiDung NguoiDung { get; set; }

        public int SanPhamId { get; set; }
        public SanPham SanPham { get; set; }
    }
}
