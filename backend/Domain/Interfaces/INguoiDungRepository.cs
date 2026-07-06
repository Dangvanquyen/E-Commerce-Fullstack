using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface INguoiDungRepository : IGenericRepository<NguoiDung>
    {
        Task<NguoiDung?> GetByEmailAsync(string email);
        Task<NguoiDung?> GetByTenDangNhapAsync(string tenDangNhap);
        Task<NguoiDung?> GetNguoiDungWithVaiTroAsync(int nguoiDungId);
        Task<NguoiDung?> GetNguoiDungWithGioHangAsync(int nguoiDungId);
        Task<NguoiDung?> GetNguoiDungWithDonHangsAsync(int nguoiDungId);
        Task<IEnumerable<NguoiDung>> GetNguoiDungsByVaiTroAsync(int vaiTroId);
        Task<bool> IsEmailExistsAsync(string email);
        Task<bool> IsTenDangNhapExistsAsync(string tenDangNhap);
    }
}
