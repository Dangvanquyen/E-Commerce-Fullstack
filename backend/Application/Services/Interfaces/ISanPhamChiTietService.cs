using Domain.Entities;
using Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface ISanPhamChiTietService
    {
        Task<IEnumerable<SanPhamChiTiet>> GetAllAsync();
        Task<(IEnumerable<SanPhamChiTiet> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<(IEnumerable<SanPhamChiTiet> Items, int TotalCount)> GetPagedInventoryAsync(
            string? searchTerm, int? danhMucId, string? stockStatus, int pageNumber, int pageSize);
        Task<InventoryStatsResponse> GetInventoryStatsAsync();
        Task<SanPhamChiTiet?> GetByIdAsync(int id);
        Task<SanPhamChiTiet?> GetChiTietWithSanPhamAsync(int sanPhamChiTietId);
        Task<IEnumerable<SanPhamChiTiet>> GetChiTietsBySanPhamAsync(int sanPhamId);
        Task<SanPhamChiTiet?> GetBySizeAndMauSacAsync(int sanPhamId, string size, string mauSac);
        Task<IEnumerable<SanPhamChiTiet>> GetAvailableChiTietsAsync(int sanPhamId);
        Task<SanPhamChiTiet> CreateAsync(SanPhamChiTiet sanPhamChiTiet);
        Task<SanPhamChiTiet?> UpdateAsync(int id, SanPhamChiTiet sanPhamChiTiet);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateSoLuongTonAsync(int sanPhamChiTietId, int soLuong);
    }
}
