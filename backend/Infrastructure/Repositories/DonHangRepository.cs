using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class DonHangRepository : GenericRepository<DonHang>, IDonHangRepository
    {
        public DonHangRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<DonHang?> GetDonHangWithChiTietsAsync(int donHangId)
        {
            return await _dbSet
                .Include(d => d.DonHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                        .ThenInclude(s => s.SanPham)
                .FirstOrDefaultAsync(d => d.DonHangId == donHangId);
        }

        public async Task<DonHang?> GetDonHangWithThanhToanAsync(int donHangId)
        {
            return await _dbSet
                .Include(d => d.ThanhToan)
                .FirstOrDefaultAsync(d => d.DonHangId == donHangId);
        }

        public async Task<DonHang?> GetDonHangFullInfoAsync(int donHangId)
        {
            return await _dbSet
                .Include(d => d.NguoiDung)
                .Include(d => d.DonHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                        .ThenInclude(s => s.SanPham)
                .Include(d => d.ThanhToan)
                .FirstOrDefaultAsync(d => d.DonHangId == donHangId);
        }

        public async Task<IEnumerable<DonHang>> GetDonHangsByNguoiDungAsync(int nguoiDungId)
        {
            return await _dbSet
                .Where(d => d.NguoiDungId == nguoiDungId)
                .Include(d => d.DonHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                        .ThenInclude(s => s.SanPham)
                .OrderByDescending(d => d.NgayDat)
                .ToListAsync();
        }

        public async Task<IEnumerable<DonHang>> GetDonHangsByTrangThaiAsync(string trangThai)
        {
            return await _dbSet
                .Where(d => d.TrangThai == trangThai)
                .Include(d => d.NguoiDung)
                .OrderByDescending(d => d.NgayDat)
                .ToListAsync();
        }

        public async Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByNguoiDungAsync(
            int nguoiDungId, int pageNumber, int pageSize)
        {
            var query = _dbSet.Where(d => d.NguoiDungId == nguoiDungId);
            var totalCount = await query.CountAsync();
            var items = await query
                .Include(d => d.DonHangChiTiets)
                    .ThenInclude(c => c.SanPhamChiTiet)
                        .ThenInclude(s => s.SanPham)
                .OrderByDescending(d => d.NgayDat)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByTrangThaiAsync(
            string trangThai, int pageNumber, int pageSize)
        {
            var query = _dbSet.Where(d => d.TrangThai == trangThai);
            var totalCount = await query.CountAsync();
            var items = await query
                .Include(d => d.NguoiDung)
                .Include(d => d.DonHangChiTiets)
                .OrderByDescending(d => d.NgayDat)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}
