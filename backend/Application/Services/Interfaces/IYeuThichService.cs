using Domain.Entities;

namespace Application.Services.Interfaces
{
    public interface IYeuThichService
    {
        Task<IEnumerable<YeuThich>> GetByNguoiDungIdAsync(int nguoiDungId);
        Task<bool> IsInWishlistAsync(int nguoiDungId, int sanPhamId);
        Task<YeuThich> AddAsync(int nguoiDungId, int sanPhamId);
        Task<bool> RemoveAsync(int nguoiDungId, int sanPhamId);
        Task<bool> ToggleAsync(int nguoiDungId, int sanPhamId);
    }
}
