using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IDanhMucRepository : IGenericRepository<DanhMuc>
    {
        Task<DanhMuc?> GetByTenDanhMucAsync(string tenDanhMuc);
        Task<DanhMuc?> GetDanhMucWithSanPhamsAsync(int danhMucId);
        Task<IEnumerable<DanhMuc>> GetActiveDanhMucsAsync();
    }
}
