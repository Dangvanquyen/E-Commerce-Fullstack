using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IGioHangChiTietRepository : IGenericRepository<GioHangChiTiet>
    {
        Task<GioHangChiTiet?> GetChiTietByGioHangAndSanPhamAsync(int gioHangId, int sanPhamChiTietId);
        Task<IEnumerable<GioHangChiTiet>> GetChiTietsByGioHangAsync(int gioHangId);
        Task<GioHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int gioHangChiTietId);
        Task RemoveAllByGioHangAsync(int gioHangId);
    }
}
