using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IThanhToanRepository : IGenericRepository<ThanhToan>
    {
        Task<ThanhToan?> GetThanhToanByDonHangAsync(int donHangId);
        Task<IEnumerable<ThanhToan>> GetThanhToansByTrangThaiAsync(string trangThai);
        Task<IEnumerable<ThanhToan>> GetThanhToansByPhuongThucAsync(string phuongThuc);
        Task<bool> UpdateTrangThaiAsync(int thanhToanId, string trangThai);
    }
}
