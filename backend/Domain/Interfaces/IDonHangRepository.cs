using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IDonHangRepository : IGenericRepository<DonHang>
    {
        Task<DonHang?> GetDonHangWithChiTietsAsync(int donHangId);
        Task<DonHang?> GetDonHangWithThanhToanAsync(int donHangId);
        Task<DonHang?> GetDonHangFullInfoAsync(int donHangId);
        Task<IEnumerable<DonHang>> GetDonHangsByNguoiDungAsync(int nguoiDungId);
        Task<IEnumerable<DonHang>> GetDonHangsByTrangThaiAsync(string trangThai);
        Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByNguoiDungAsync(
            int nguoiDungId, int pageNumber, int pageSize);
        Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByTrangThaiAsync(
            string trangThai, int pageNumber, int pageSize);
    }
}
