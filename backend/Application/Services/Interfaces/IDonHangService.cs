using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IDonHangService
    {
        Task<IEnumerable<DonHang>> GetAllAsync();
        Task<(IEnumerable<DonHang> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize);
        Task<DonHang?> GetByIdAsync(int id);
        Task<DonHang?> GetDonHangWithChiTietsAsync(int donHangId);
        Task<DonHang?> GetDonHangWithThanhToanAsync(int donHangId);
        Task<DonHang?> GetDonHangFullInfoAsync(int donHangId);
        Task<IEnumerable<DonHang>> GetDonHangsByNguoiDungAsync(int nguoiDungId);
        Task<IEnumerable<DonHang>> GetDonHangsByTrangThaiAsync(string trangThai);
        Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByNguoiDungAsync(
            int nguoiDungId, int pageNumber, int pageSize);
        Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByTrangThaiAsync(
            string trangThai, int pageNumber, int pageSize);
        Task<DonHang> CreateAsync(DonHang donHang);
        Task<DonHang> CreateFromGioHangAsync(int nguoiDungId, string diaChiGiaoHang, string phuongThucThanhToan = "COD", string? voucherCode = null, List<int>? gioHangChiTietIds = null);
        Task<DonHang> CreateDirectAsync(int nguoiDungId, string diaChiGiaoHang, List<(int SanPhamChiTietId, int SoLuong, decimal DonGia)> items, string phuongThucThanhToan = "COD", string? voucherCode = null);
        Task<DonHang?> UpdateAsync(int id, DonHang donHang);
        Task<bool> UpdateTrangThaiAsync(int id, string trangThai);
        Task<bool> DeleteAsync(int id);
    }
}
