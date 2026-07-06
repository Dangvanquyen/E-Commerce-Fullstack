using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ThongBaoRepository : GenericRepository<ThongBao>, IThongBaoRepository
    {
        public ThongBaoRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ThongBao>> GetByNguoiDungIdAsync(int userId, int limit = 20)
        {
            return await _dbSet
                .Where(x => x.NguoiDungId == userId)
                .OrderByDescending(x => x.NgayTao)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<ThongBao>> GetAdminNotificationsAsync(int limit = 20)
        {
            // Thông báo gửi cho admin là thông báo có NguoiDungId == null HOẶC LoaiThongBao == "DonHang"
            return await _dbSet
                .Where(x => x.NguoiDungId == null)
                .OrderByDescending(x => x.NgayTao)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(int? userId)
        {
            if (userId.HasValue)
            {
                return await _dbSet.CountAsync(x => x.NguoiDungId == userId && !x.DaDoc);
            }
            else
            {
                // Admin unread count
                return await _dbSet.CountAsync(x => x.NguoiDungId == null && !x.DaDoc);
            }
        }

        public async Task MarkAsReadAsync(int thongBaoId)
        {
            var thongBao = await _dbSet.FindAsync(thongBaoId);
            if (thongBao != null && !thongBao.DaDoc)
            {
                thongBao.DaDoc = true;
                _context.Update(thongBao);
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int? userId)
        {
            var query = _dbSet.Where(x => !x.DaDoc);
            if (userId.HasValue)
            {
                query = query.Where(x => x.NguoiDungId == userId);
            }
            else
            {
                query = query.Where(x => x.NguoiDungId == null);
            }

            var unread = await query.ToListAsync();
            foreach (var tb in unread)
            {
                tb.DaDoc = true;
            }

            if (unread.Any())
            {
                _context.UpdateRange(unread);
                await _context.SaveChangesAsync();
            }
        }
    }
}
