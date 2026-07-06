using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class DanhMuc
    {
        public int DanhMucId { get; set; }
        public string TenDanhMuc { get; set; }
        public string MoTa { get; set; }
        public bool TrangThai { get; set; }

        public ICollection<SanPham> SanPhams { get; set; }
    }
}
