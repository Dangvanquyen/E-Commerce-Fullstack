using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IGioHangChiTietService
    {
        Task<GioHangChiTiet?> GetByIdAsync(int id);
        Task<GioHangChiTiet?> GetChiTietByGioHangAndSanPhamAsync(int gioHangId, int sanPhamChiTietId);
        Task<IEnumerable<GioHangChiTiet>> GetChiTietsByGioHangAsync(int gioHangId);
        Task<GioHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int gioHangChiTietId);
        Task<GioHangChiTiet> AddToCartAsync(int gioHangId, int sanPhamChiTietId, int soLuong);
        Task<GioHangChiTiet?> UpdateSoLuongAsync(int gioHangChiTietId, int soLuong);
        Task<bool> RemoveFromCartAsync(int gioHangChiTietId);
        Task<bool> RemoveAllByGioHangAsync(int gioHangId);
    }
}
