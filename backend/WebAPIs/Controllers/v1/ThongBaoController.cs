using Application.DTOs.Responses;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class ThongBaoController : ControllerBase
    {
        private readonly IThongBaoService _thongBaoService;

        public ThongBaoController(IThongBaoService thongBaoService)
        {
            _thongBaoService = thongBaoService;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        /// <summary>
        /// Lấy danh sách thông báo của khách hàng đang đăng nhập
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int limit = 20)
        {
            var userId = GetCurrentUserId();
            var data = await _thongBaoService.GetByNguoiDungIdAsync(userId, limit);
            return Ok(ApiResponse<IEnumerable<ThongBaoResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Lấy danh sách thông báo của Admin
        /// </summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminNotifications([FromQuery] int limit = 20)
        {
            var data = await _thongBaoService.GetAdminNotificationsAsync(limit);
            return Ok(ApiResponse<IEnumerable<ThongBaoResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Lấy số lượng thông báo chưa đọc của user/admin đang đăng nhập
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var isAdmin = User.IsInRole("Admin");
            int? userId = isAdmin ? null : (int?)GetCurrentUserId();
            
            var count = await _thongBaoService.GetUnreadCountAsync(userId);
            return Ok(ApiResponse<int>.SuccessResponse(count));
        }

        /// <summary>
        /// Đánh dấu đã đọc 1 thông báo
        /// </summary>
        [HttpPut("read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _thongBaoService.MarkAsReadAsync(id);
            return Ok(ApiResponse<string>.SuccessResponse("Thành công"));
        }

        /// <summary>
        /// Đánh dấu tất cả đã đọc
        /// </summary>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var isAdmin = User.IsInRole("Admin");
            int? userId = isAdmin ? null : (int?)GetCurrentUserId();

            await _thongBaoService.MarkAllAsReadAsync(userId);
            return Ok(ApiResponse<string>.SuccessResponse("Thành công"));
        }
    }
}
