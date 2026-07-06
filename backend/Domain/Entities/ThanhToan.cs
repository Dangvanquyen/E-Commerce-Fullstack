using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class ThanhToan
    {
        public int ThanhToanId { get; set; }
        public string PhuongThuc { get; set; }
        public string TrangThai { get; set; }
        public DateTime? NgayThanhToan { get; set; }

        public int DonHangId { get; set; }
        public DonHang DonHang { get; set; }
    }
}
