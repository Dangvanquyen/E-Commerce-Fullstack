using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface ISanPhamChiTietRepository : IGenericRepository<SanPhamChiTiet>
    {
        Task<SanPhamChiTiet?> GetChiTietWithSanPhamAsync(int sanPhamChiTietId);
        Task<IEnumerable<SanPhamChiTiet>> GetChiTietsBySanPhamAsync(int sanPhamId);
        Task<SanPhamChiTiet?> GetBySizeAndMauSacAsync(int sanPhamId, string size, string mauSac);
        Task<IEnumerable<SanPhamChiTiet>> GetAvailableChiTietsAsync(int sanPhamId);
        Task<bool> UpdateSoLuongTonAsync(int sanPhamChiTietId, int soLuong);
        Task<(IEnumerable<SanPhamChiTiet> Items, int TotalCount)> GetPagedInventoryAsync(
            string? searchTerm, int? danhMucId, string? stockStatus, int pageNumber, int pageSize);
    }
}
