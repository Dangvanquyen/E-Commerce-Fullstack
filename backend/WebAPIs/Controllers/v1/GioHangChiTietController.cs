using Application.DTOs.Requests;
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
    public class GioHangChiTietController : ControllerBase
    {
        private readonly IGioHangService _gioHangService;
        private readonly IGioHangChiTietService _gioHangChiTietService;
        private readonly IMapper _mapper;

        public GioHangChiTietController(
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
        /// Thêm sản phẩm vào giỏ hàng
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<GioHangChiTietResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<GioHangChiTietResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddToCart([FromBody] AddToGioHangRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<GioHangChiTietResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<GioHangChiTietResponse>.ErrorResponse("Không xác định được người dùng"));
            }

            // Lấy hoặc tạo giỏ hàng
            var gioHang = await _gioHangService.GetOrCreateGioHangAsync(nguoiDungId);
            if (gioHang == null)
            {
                return BadRequest(ApiResponse<GioHangChiTietResponse>.ErrorResponse("Không thể tạo giỏ hàng"));
            }

            var chiTiet = await _gioHangChiTietService.AddToCartAsync(
                gioHang.GioHangId,
                request.SanPhamChiTietId,
                request.SoLuong);

            var response = _mapper.Map<GioHangChiTietResponse>(chiTiet);
            return CreatedAtAction(nameof(GetById), new { id = chiTiet.GioHangChiTietId },
                ApiResponse<GioHangChiTietResponse>.SuccessResponse(response, "Thêm vào giỏ hàng thành công"));
        }

        /// <summary>
        /// Lấy chi tiết một item trong giỏ hàng
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<GioHangChiTietResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GioHangChiTietResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var chiTiet = await _gioHangChiTietService.GetChiTietWithSanPhamInfoAsync(id);
            if (chiTiet == null)
            {
                return NotFound(ApiResponse<GioHangChiTietResponse>.ErrorResponse("Không tìm thấy sản phẩm trong giỏ hàng"));
            }

            var response = _mapper.Map<GioHangChiTietResponse>(chiTiet);
            return Ok(ApiResponse<GioHangChiTietResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Cập nhật số lượng sản phẩm trong giỏ hàng
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<GioHangChiTietResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GioHangChiTietResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] UpdateGioHangChiTietRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<GioHangChiTietResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var chiTiet = await _gioHangChiTietService.UpdateSoLuongAsync(id, request.SoLuong);
            
            // Nếu số lượng = 0, sản phẩm đã bị xóa
            if (chiTiet == null && request.SoLuong <= 0)
            {
                return Ok(ApiResponse<GioHangChiTietResponse>.SuccessResponse(null!, "Đã xóa sản phẩm khỏi giỏ hàng"));
            }

            if (chiTiet == null)
            {
                return NotFound(ApiResponse<GioHangChiTietResponse>.ErrorResponse("Không tìm thấy sản phẩm trong giỏ hàng"));
            }

            var response = _mapper.Map<GioHangChiTietResponse>(chiTiet);
            return Ok(ApiResponse<GioHangChiTietResponse>.SuccessResponse(response, "Cập nhật số lượng thành công"));
        }

        /// <summary>
        /// Xóa sản phẩm khỏi giỏ hàng
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveFromCart(int id)
        {
            var result = await _gioHangChiTietService.RemoveFromCartAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy sản phẩm trong giỏ hàng"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã xóa sản phẩm khỏi giỏ hàng"));
        }
    }
}
