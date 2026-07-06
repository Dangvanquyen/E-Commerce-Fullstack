using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IGioHangRepository : IGenericRepository<GioHang>
    {
        Task<GioHang?> GetGioHangByNguoiDungAsync(int nguoiDungId);
        Task<GioHang?> GetGioHangWithChiTietsAsync(int gioHangId);
        Task<GioHang?> GetGioHangFullInfoAsync(int nguoiDungId);
        Task<IEnumerable<GioHang>> GetAllNonEmptyCartsAsync();
    }
}
