using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IVaiTroRepository : IGenericRepository<VaiTro>
    {
        Task<VaiTro?> GetByTenVaiTroAsync(string tenVaiTro);
        Task<VaiTro?> GetVaiTroWithNguoiDungsAsync(int vaiTroId);
    }
}
