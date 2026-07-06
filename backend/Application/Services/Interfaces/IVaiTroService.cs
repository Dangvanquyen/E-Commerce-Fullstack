using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IVaiTroService
    {
        Task<IEnumerable<VaiTro>> GetAllAsync();
        Task<VaiTro?> GetByIdAsync(int id);
        Task<VaiTro?> GetByTenVaiTroAsync(string tenVaiTro);
        Task<VaiTro?> GetVaiTroWithNguoiDungsAsync(int vaiTroId);
        Task<VaiTro> CreateAsync(VaiTro vaiTro);
        Task<VaiTro?> UpdateAsync(int id, VaiTro vaiTro);
        Task<bool> DeleteAsync(int id);
    }
}
