using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ISanPhamRepository : IGenericRepository<SanPham>
    {
        Task<SanPham?> GetSanPhamWithChiTietAsync(int sanPhamId);
        Task<SanPham?> GetSanPhamWithDanhMucAsync(int sanPhamId);
        Task<SanPham?> GetSanPhamWithFullDetailsAsync(int sanPhamId);
        Task<IEnumerable<SanPham>> GetSanPhamsByDanhMucAsync(int danhMucId);
        Task<IEnumerable<SanPham>> GetActiveSanPhamsAsync();
        Task<IEnumerable<SanPham>> SearchSanPhamsAsync(string keyword);
        Task<(IEnumerable<SanPham> Items, int TotalCount)> GetSanPhamsPagedByDanhMucAsync(
            int danhMucId, int pageNumber, int pageSize);
    }
}
