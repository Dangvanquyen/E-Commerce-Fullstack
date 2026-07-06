using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IDonHangChiTietService
    {
        Task<DonHangChiTiet?> GetByIdAsync(int id);
        Task<IEnumerable<DonHangChiTiet>> GetChiTietsByDonHangAsync(int donHangId);
        Task<DonHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int donHangChiTietId);
        Task<decimal> GetTongTienByDonHangAsync(int donHangId);
        Task<DonHangChiTiet> CreateAsync(DonHangChiTiet donHangChiTiet);
        Task<DonHangChiTiet?> UpdateAsync(int id, DonHangChiTiet donHangChiTiet);
        Task<bool> DeleteAsync(int id);
    }
}
