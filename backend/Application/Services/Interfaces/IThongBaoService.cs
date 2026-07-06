using Application.DTOs.Requests;
using Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IThongBaoService
    {
        Task<IEnumerable<ThongBaoResponse>> GetByNguoiDungIdAsync(int userId, int limit = 20);
        Task<IEnumerable<ThongBaoResponse>> GetAdminNotificationsAsync(int limit = 20);
        Task<int> GetUnreadCountAsync(int? userId);
        Task MarkAsReadAsync(int thongBaoId);
        Task MarkAllAsReadAsync(int? userId);
        Task<ThongBaoResponse> CreateNotificationAsync(CreateThongBaoRequest request);
        Task TaoThongBaoDonHangMoiAsync(int orderId, string customerName, decimal totalAmount);
        Task TaoThongBaoCapNhatTrangThaiDonHangAsync(int orderId, int userId, string oldStatus, string newStatus);
    }
}
