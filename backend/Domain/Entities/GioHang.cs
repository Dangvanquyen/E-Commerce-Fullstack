using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class GioHang
    {
        public int GioHangId { get; set; }
        public DateTime NgayTao { get; set; }

        public int NguoiDungId { get; set; }
        public NguoiDung NguoiDung { get; set; }

        public ICollection<GioHangChiTiet> GioHangChiTiets { get; set; }
    }
}
