using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ThongBaoService : IThongBaoService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ThongBaoService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<ThongBaoResponse>> GetByNguoiDungIdAsync(int userId, int limit = 20)
        {
            var notifications = await _unitOfWork.ThongBao.GetByNguoiDungIdAsync(userId, limit);
            return notifications.Select(MapToResponse);
        }

        public async Task<IEnumerable<ThongBaoResponse>> GetAdminNotificationsAsync(int limit = 20)
        {
            var notifications = await _unitOfWork.ThongBao.GetAdminNotificationsAsync(limit);
            return notifications.Select(MapToResponse);
        }

        public async Task<int> GetUnreadCountAsync(int? userId)
        {
            return await _unitOfWork.ThongBao.GetUnreadCountAsync(userId);
        }

        public async Task MarkAsReadAsync(int thongBaoId)
        {
            await _unitOfWork.ThongBao.MarkAsReadAsync(thongBaoId);
        }

        public async Task MarkAllAsReadAsync(int? userId)
        {
            await _unitOfWork.ThongBao.MarkAllAsReadAsync(userId);
        }

        public async Task<ThongBaoResponse> CreateNotificationAsync(CreateThongBaoRequest request)
        {
            var tb = new ThongBao
            {
                NguoiDungId = request.NguoiDungId,
                TieuDe = request.TieuDe,
                NoiDung = request.NoiDung,
                LoaiThongBao = request.LoaiThongBao,
                LienKet = request.LienKet,
                DaDoc = false,
                NgayTao = DateTime.Now
            };

            await _unitOfWork.ThongBao.AddAsync(tb);
            await _unitOfWork.SaveChangesAsync();

            return MapToResponse(tb);
        }

        public async Task TaoThongBaoDonHangMoiAsync(int orderId, string customerName, decimal totalAmount)
        {
            var req = new CreateThongBaoRequest
            {
                NguoiDungId = null, // Gửi cho Admin
                TieuDe = "Đơn hàng mới! 🛒",
                NoiDung = $"Khách hàng **{customerName}** vừa tạo đơn hàng mới **#{orderId}** trị giá **{totalAmount:N0}đ**.",
                LoaiThongBao = "DonHang",
                LienKet = $"/admin/orders" // Redirect tới danh sách quản lý đơn hàng
            };

            await CreateNotificationAsync(req);
        }

        public async Task TaoThongBaoCapNhatTrangThaiDonHangAsync(int orderId, int userId, string oldStatus, string newStatus)
        {
            string statusVn = ConvertStatusToVn(newStatus);
            var req = new CreateThongBaoRequest
            {
                NguoiDungId = userId, // Gửi cho Customer cụ thể
                TieuDe = "Cập nhật trạng thái đơn hàng 📦",
                NoiDung = $"Đơn hàng **#{orderId}** của bạn đã chuyển sang trạng thái: **{statusVn}**.",
                LoaiThongBao = "DonHang",
                LienKet = "/profile" // Redirect tới lịch sử mua hàng của khách hàng
            };

            await CreateNotificationAsync(req);
        }

        private string ConvertStatusToVn(string status)
        {
            return status switch
            {
                "ChoXuLy" => "Chờ xử lý",
                "DaXacNhan" => "Đã xác nhận",
                "DangGiao" => "Đang giao hàng",
                "HoanThanh" => "Hoàn thành",
                "DaHuy" => "Đã hủy đơn hàng",
                _ => status
            };
        }

        private string GetRelativeTime(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1)
                return "Vừa xong";
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} phút trước";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} giờ trước";
            if (timeSpan.TotalDays < 30)
                return $"{(int)timeSpan.TotalDays} ngày trước";
            
            return dateTime.ToString("dd/MM/yyyy HH:mm");
        }

        private ThongBaoResponse MapToResponse(ThongBao tb)
        {
            return new ThongBaoResponse
            {
                ThongBaoId = tb.ThongBaoId,
                NguoiDungId = tb.NguoiDungId,
                TieuDe = tb.TieuDe,
                NoiDung = tb.NoiDung,
                LoaiThongBao = tb.LoaiThongBao,
                LienKet = tb.LienKet,
                DaDoc = tb.DaDoc,
                NgayTao = tb.NgayTao,
                ThoiGianTuongDoi = GetRelativeTime(tb.NgayTao)
            };
        }
    }
}
