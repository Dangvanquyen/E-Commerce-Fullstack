using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IMaGiamGiaService
    {
        Task<IEnumerable<MaGiamGia>> GetAllAsync();
        Task<IEnumerable<MaGiamGia>> GetActiveVouchersAsync();
        Task<(IEnumerable<MaGiamGia> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<MaGiamGia?> GetByIdAsync(int id);
        Task<MaGiamGia?> GetByCodeAsync(string code);
        Task<MaGiamGia> CreateAsync(MaGiamGia maGiamGia);
        Task<MaGiamGia?> UpdateAsync(int id, MaGiamGia maGiamGia);
        Task<bool> DeleteAsync(int id);
        Task<bool> UpdateTrangThaiAsync(int id, bool trangThai);
        Task<(bool IsValid, decimal DiscountAmount, string Message)> ValidateVoucherAsync(string code, decimal orderAmount);
    }
}
