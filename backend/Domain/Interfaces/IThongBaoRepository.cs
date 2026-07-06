using Domain.Entities;
using Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IThongBaoRepository : IGenericRepository<ThongBao>
    {
        Task<IEnumerable<ThongBao>> GetByNguoiDungIdAsync(int userId, int limit = 20);
        Task<IEnumerable<ThongBao>> GetAdminNotificationsAsync(int limit = 20);
        Task<int> GetUnreadCountAsync(int? userId);
        Task MarkAsReadAsync(int thongBaoId);
        Task MarkAllAsReadAsync(int? userId);
    }
}
