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
    public class YeuThichController : ControllerBase
    {
        private readonly IYeuThichService _yeuThichService;
        private readonly IMapper _mapper;

        public YeuThichController(IYeuThichService yeuThichService, IMapper mapper)
        {
            _yeuThichService = yeuThichService;
            _mapper = mapper;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Lấy danh sách yêu thích của user hiện tại
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<YeuThichResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyWishlist()
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<IEnumerable<YeuThichResponse>>.ErrorResponse("Không xác định được người dùng"));
            }

            var wishlist = await _yeuThichService.GetByNguoiDungIdAsync(nguoiDungId);
            var response = _mapper.Map<IEnumerable<YeuThichResponse>>(wishlist);
            return Ok(ApiResponse<IEnumerable<YeuThichResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Kiểm tra sản phẩm có trong danh sách yêu thích không
        /// </summary>
        [HttpGet("check/{sanPhamId}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CheckInWishlist(int sanPhamId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResponse("Không xác định được người dùng"));
            }

            var isInWishlist = await _yeuThichService.IsInWishlistAsync(nguoiDungId, sanPhamId);
            return Ok(ApiResponse<bool>.SuccessResponse(isInWishlist));
        }

        /// <summary>
        /// Toggle yêu thích (thêm nếu chưa có, xóa nếu đã có)
        /// </summary>
        [HttpPost("toggle/{sanPhamId}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ToggleWishlist(int sanPhamId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResponse("Không xác định được người dùng"));
            }

            try
            {
                var isAdded = await _yeuThichService.ToggleAsync(nguoiDungId, sanPhamId);
                var message = isAdded ? "Đã thêm vào danh sách yêu thích" : "Đã xóa khỏi danh sách yêu thích";
                return Ok(ApiResponse<bool>.SuccessResponse(isAdded, message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Xóa sản phẩm khỏi danh sách yêu thích
        /// </summary>
        [HttpDelete("{sanPhamId}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        public async Task<IActionResult> RemoveFromWishlist(int sanPhamId)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<bool>.ErrorResponse("Không xác định được người dùng"));
            }

            var result = await _yeuThichService.RemoveAsync(nguoiDungId, sanPhamId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Sản phẩm không có trong danh sách yêu thích"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã xóa khỏi danh sách yêu thích"));
        }
    }
}
