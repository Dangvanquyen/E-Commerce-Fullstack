using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IDanhMucService
    {
        Task<IEnumerable<DanhMuc>> GetAllAsync();
        Task<IEnumerable<DanhMuc>> GetActiveDanhMucsAsync();
        Task<(IEnumerable<DanhMuc> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<DanhMuc?> GetByIdAsync(int id);
        Task<DanhMuc?> GetByTenDanhMucAsync(string tenDanhMuc);
        Task<DanhMuc?> GetDanhMucWithSanPhamsAsync(int danhMucId);
        Task<DanhMuc> CreateAsync(DanhMuc danhMuc);
        Task<DanhMuc?> UpdateAsync(int id, DanhMuc danhMuc);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateTrangThaiAsync(int id, bool trangThai);
    }
}
