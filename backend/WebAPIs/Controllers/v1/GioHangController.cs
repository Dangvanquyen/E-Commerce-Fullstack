using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class GioHangController : ControllerBase
    {
        private readonly IGioHangService _gioHangService;
        private readonly IGioHangChiTietService _gioHangChiTietService;
        private readonly IMapper _mapper;

        public GioHangController(
            IGioHangService gioHangService,
            IGioHangChiTietService gioHangChiTietService,
            IMapper mapper)
        {
            _gioHangService = gioHangService;
            _gioHangChiTietService = gioHangChiTietService;
            _mapper = mapper;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Lấy giỏ hàng của người dùng hiện tại
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<GioHangResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyCart()
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<GioHangResponse>.ErrorResponse("Không xác định được người dùng"));
            }

            var gioHang = await _gioHangService.GetGioHangFullInfoAsync(nguoiDungId);
            if (gioHang == null)
            {
                // Tạo giỏ hàng mới nếu chưa có
                gioHang = await _gioHangService.CreateAsync(nguoiDungId);
            }

            var response = _mapper.Map<GioHangResponse>(gioHang);
            return Ok(ApiResponse<GioHangResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Xóa toàn bộ giỏ hàng
        /// </summary>
        [HttpDelete]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ClearCart()
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResponse("Không xác định được người dùng"));
            }

            var result = await _gioHangService.ClearGioHangAsync(nguoiDungId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy giỏ hàng"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã xóa toàn bộ giỏ hàng"));
        }

        /// <summary>
        /// Danh sách giỏ hàng chưa mua (Admin)
        /// </summary>
        [HttpGet("admin/abandoned")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<GioHangAdminResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAbandonedCarts()
        {
            var data = await _gioHangService.GetAllAbandonedCartsAsync();
            return Ok(ApiResponse<IEnumerable<GioHangAdminResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Thống kê sản phẩm trong giỏ hàng chưa mua (Admin)
        /// </summary>
        [HttpGet("admin/abandoned-products")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamGioHangChuaMuaResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAbandonedProducts()
        {
            var data = await _gioHangService.GetSanPhamTrongGioChuaMuaAsync();
            return Ok(ApiResponse<IEnumerable<SanPhamGioHangChuaMuaResponse>>.SuccessResponse(data));
        }
    }
}
