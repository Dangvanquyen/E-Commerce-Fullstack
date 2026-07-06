using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IYeuThichRepository : IGenericRepository<YeuThich>
    {
        Task<IEnumerable<YeuThich>> GetByNguoiDungIdAsync(int nguoiDungId);
        Task<YeuThich?> GetByNguoiDungAndSanPhamAsync(int nguoiDungId, int sanPhamId);
        Task<bool> IsInWishlistAsync(int nguoiDungId, int sanPhamId);
    }
}
