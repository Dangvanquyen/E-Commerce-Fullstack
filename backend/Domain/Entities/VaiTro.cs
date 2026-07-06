using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class VaiTro
    {
        public int VaiTroId { get; set; }
        public string TenVaiTro { get; set; }
        public string MoTa { get; set; }

        public ICollection<NguoiDung> NguoiDungs { get; set; }
    }
}
