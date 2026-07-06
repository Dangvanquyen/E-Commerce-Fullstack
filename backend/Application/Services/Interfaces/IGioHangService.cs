using Application.DTOs.Responses;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IGioHangService
    {
        Task<GioHang?> GetByIdAsync(int id);
        Task<GioHang?> GetGioHangByNguoiDungAsync(int nguoiDungId);
        Task<GioHang?> GetGioHangWithChiTietsAsync(int gioHangId);
        Task<GioHang?> GetGioHangFullInfoAsync(int nguoiDungId);
        Task<GioHang> CreateAsync(int nguoiDungId);
        Task<GioHang?> GetOrCreateGioHangAsync(int nguoiDungId);
        Task<bool> DeleteAsync(int id);
        Task<bool> ClearGioHangAsync(int nguoiDungId);
        Task<IEnumerable<GioHangAdminResponse>> GetAllAbandonedCartsAsync();
        Task<IEnumerable<SanPhamGioHangChuaMuaResponse>> GetSanPhamTrongGioChuaMuaAsync();
    }
}
