using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface ISanPhamService
    {
        Task<IEnumerable<SanPham>> GetAllAsync();
        Task<IEnumerable<SanPham>> GetActiveSanPhamsAsync();
        Task<(IEnumerable<SanPham> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<SanPham?> GetByIdAsync(int id);
        Task<SanPham?> GetSanPhamWithChiTietAsync(int sanPhamId);
        Task<SanPham?> GetSanPhamWithDanhMucAsync(int sanPhamId);
        Task<SanPham?> GetSanPhamWithFullDetailsAsync(int sanPhamId);
        Task<IEnumerable<SanPham>> GetSanPhamsByDanhMucAsync(int danhMucId);
        Task<(IEnumerable<SanPham> Items, int TotalCount)> GetSanPhamsPagedByDanhMucAsync(
            int danhMucId, int pageNumber, int pageSize);
        Task<IEnumerable<SanPham>> SearchSanPhamsAsync(string keyword);
        Task<SanPham> CreateAsync(SanPham sanPham);
        Task<SanPham?> UpdateAsync(int id, SanPham sanPham);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateTrangThaiAsync(int id, bool trangThai);
    }
}
