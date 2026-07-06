using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Services
{
    public class YeuThichService : IYeuThichService
    {
        private readonly IUnitOfWork _unitOfWork;

        public YeuThichService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<YeuThich>> GetByNguoiDungIdAsync(int nguoiDungId)
        {
            return await _unitOfWork.YeuThich.GetByNguoiDungIdAsync(nguoiDungId);
        }

        public async Task<bool> IsInWishlistAsync(int nguoiDungId, int sanPhamId)
        {
            return await _unitOfWork.YeuThich.IsInWishlistAsync(nguoiDungId, sanPhamId);
        }

        public async Task<YeuThich> AddAsync(int nguoiDungId, int sanPhamId)
        {
            // Kiểm tra đã tồn tại chưa
            var existing = await _unitOfWork.YeuThich.GetByNguoiDungAndSanPhamAsync(nguoiDungId, sanPhamId);
            if (existing != null)
            {
                throw new InvalidOperationException("Sản phẩm đã có trong danh sách yêu thích");
            }

            // Kiểm tra sản phẩm có tồn tại không
            var sanPham = await _unitOfWork.SanPham.GetByIdAsync(sanPhamId);
            if (sanPham == null)
            {
                throw new InvalidOperationException("Sản phẩm không tồn tại");
            }

            var yeuThich = new YeuThich
            {
                NguoiDungId = nguoiDungId,
                SanPhamId = sanPhamId,
                NgayThem = DateTime.Now
            };

            await _unitOfWork.YeuThich.AddAsync(yeuThich);
            await _unitOfWork.SaveChangesAsync();
            return yeuThich;
        }

        public async Task<bool> RemoveAsync(int nguoiDungId, int sanPhamId)
        {
            var yeuThich = await _unitOfWork.YeuThich.GetByNguoiDungAndSanPhamAsync(nguoiDungId, sanPhamId);
            if (yeuThich == null)
            {
                return false;
            }

            _unitOfWork.YeuThich.Remove(yeuThich);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleAsync(int nguoiDungId, int sanPhamId)
        {
            var existing = await _unitOfWork.YeuThich.GetByNguoiDungAndSanPhamAsync(nguoiDungId, sanPhamId);
            
            if (existing != null)
            {
                // Đã tồn tại -> Xóa
                _unitOfWork.YeuThich.Remove(existing);
                await _unitOfWork.SaveChangesAsync();
                return false; // Trả về false = đã xóa
            }
            else
            {
                // Chưa tồn tại -> Thêm
                var yeuThich = new YeuThich
                {
                    NguoiDungId = nguoiDungId,
                    SanPhamId = sanPhamId,
                    NgayThem = DateTime.Now
                };
                await _unitOfWork.YeuThich.AddAsync(yeuThich);
                await _unitOfWork.SaveChangesAsync();
                return true; // Trả về true = đã thêm
            }
        }
    }
}
