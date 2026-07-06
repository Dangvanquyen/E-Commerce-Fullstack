using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface INguoiDungService
    {
        Task<IEnumerable<NguoiDung>> GetAllAsync();
        Task<(IEnumerable<NguoiDung> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<NguoiDung?> GetByIdAsync(int id);
        Task<NguoiDung?> GetByEmailAsync(string email);
        Task<NguoiDung?> GetByTenDangNhapAsync(string tenDangNhap);
        Task<NguoiDung?> GetNguoiDungWithVaiTroAsync(int nguoiDungId);
        Task<NguoiDung?> GetNguoiDungWithGioHangAsync(int nguoiDungId);
        Task<NguoiDung?> GetNguoiDungWithDonHangsAsync(int nguoiDungId);
        Task<IEnumerable<NguoiDung>> GetNguoiDungsByVaiTroAsync(int vaiTroId);
        Task<NguoiDung> CreateAsync(NguoiDung nguoiDung);
        Task<NguoiDung?> UpdateAsync(int id, NguoiDung nguoiDung);
        Task<bool> DeleteAsync(int id);
        Task<bool> IsEmailExistsAsync(string email);
        Task<bool> IsTenDangNhapExistsAsync(string tenDangNhap);
        Task<bool> UpdateTrangThaiAsync(int id, bool trangThai);
        Task<bool> UpdateVaiTroAsync(int id, int vaiTroId);
    }
}
