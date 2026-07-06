using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IDonHangChiTietRepository : IGenericRepository<DonHangChiTiet>
    {
        Task<IEnumerable<DonHangChiTiet>> GetChiTietsByDonHangAsync(int donHangId);
        Task<DonHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int donHangChiTietId);
        Task<decimal> GetTongTienByDonHangAsync(int donHangId);
    }
}
