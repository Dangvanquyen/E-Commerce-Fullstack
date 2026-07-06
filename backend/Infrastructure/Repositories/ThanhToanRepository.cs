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
    public class ThanhToanRepository : GenericRepository<ThanhToan>, IThanhToanRepository
    {
        public ThanhToanRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<ThanhToan?> GetThanhToanByDonHangAsync(int donHangId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(t => t.DonHangId == donHangId);
        }

        public async Task<IEnumerable<ThanhToan>> GetThanhToansByTrangThaiAsync(string trangThai)
        {
            return await _dbSet
                .Where(t => t.TrangThai == trangThai)
                .Include(t => t.DonHang)
                .ToListAsync();
        }

        public async Task<IEnumerable<ThanhToan>> GetThanhToansByPhuongThucAsync(string phuongThuc)
        {
            return await _dbSet
                .Where(t => t.PhuongThuc == phuongThuc)
                .Include(t => t.DonHang)
                .ToListAsync();
        }

        public async Task<bool> UpdateTrangThaiAsync(int thanhToanId, string trangThai)
        {
            var thanhToan = await _dbSet.FindAsync(thanhToanId);
            if (thanhToan == null)
                return false;

            thanhToan.TrangThai = trangThai;
            if (trangThai == "DaThanhToan")
            {
                thanhToan.NgayThanhToan = DateTime.Now;
            }
            return true;
        }
    }
}
