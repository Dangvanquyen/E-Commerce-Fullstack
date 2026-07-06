using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IThanhToanService
    {
        Task<ThanhToan?> GetByIdAsync(int id);
        Task<ThanhToan?> GetThanhToanByDonHangAsync(int donHangId);
        Task<IEnumerable<ThanhToan>> GetThanhToansByTrangThaiAsync(string trangThai);
        Task<IEnumerable<ThanhToan>> GetThanhToansByPhuongThucAsync(string phuongThuc);
        Task<ThanhToan> CreateAsync(ThanhToan thanhToan);
        Task<ThanhToan> CreateForDonHangAsync(int donHangId, string phuongThuc);
        Task<ThanhToan?> UpdateAsync(int id, ThanhToan thanhToan);
        Task<bool> UpdateTrangThaiAsync(int thanhToanId, string trangThai);
        Task<bool> DeleteAsync(int id);
    }
}
