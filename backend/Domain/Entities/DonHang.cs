using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class DonHang
    {
        public int DonHangId { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThai { get; set; }
        public string DiaChiGiaoHang { get; set; }
        public DateTime NgayDat { get; set; }

        public int NguoiDungId { get; set; }
        public NguoiDung NguoiDung { get; set; }

        public int? MaGiamGiaId { get; set; }
        public MaGiamGia? MaGiamGia { get; set; }
        public decimal TienGiam { get; set; } = 0;

        public ICollection<DonHangChiTiet> DonHangChiTiets { get; set; }
        public ThanhToan ThanhToan { get; set; }
    }
}
