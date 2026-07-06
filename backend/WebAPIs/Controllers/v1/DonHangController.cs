using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class DonHangController : ControllerBase
    {
        private readonly IDonHangService _donHangService;
        private readonly IThanhToanService _thanhToanService;
        private readonly IMapper _mapper;

        public DonHangController(
            IDonHangService donHangService,
            IThanhToanService thanhToanService,
            IMapper mapper)
        {
            _donHangService = donHangService;
            _thanhToanService = thanhToanService;
            _mapper = mapper;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        /// <summary>
        /// Lấy tất cả đơn hàng (Admin)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DonHangResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var donHangs = await _donHangService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<DonHangResponse>>(donHangs);
            return Ok(ApiResponse<IEnumerable<DonHangResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách đơn hàng có phân trang (Admin)
        /// </summary>
        [HttpGet("paged")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<DonHangResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _donHangService.GetPagedAsync(pageNumber, pageSize);
            var response = new PagedResponse<DonHangResponse>
            {
                Items = _mapper.Map<IEnumerable<DonHangResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<DonHangResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy đơn hàng của người dùng hiện tại
        /// </summary>
        [HttpGet("my-orders")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DonHangResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyOrders()
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<IEnumerable<DonHangResponse>>.ErrorResponse("Không xác định được người dùng"));
            }

            var donHangs = await _donHangService.GetDonHangsByNguoiDungAsync(nguoiDungId);
            var response = _mapper.Map<IEnumerable<DonHangResponse>>(donHangs);
            return Ok(ApiResponse<IEnumerable<DonHangResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy đơn hàng của người dùng hiện tại có phân trang
        /// </summary>
        [HttpGet("my-orders/paged")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<DonHangResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMyOrdersPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<PagedResponse<DonHangResponse>>.ErrorResponse("Không xác định được người dùng"));
            }

            var (items, totalCount) = await _donHangService.GetDonHangsPagedByNguoiDungAsync(nguoiDungId, pageNumber, pageSize);
            var response = new PagedResponse<DonHangResponse>
            {
                Items = _mapper.Map<IEnumerable<DonHangResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<DonHangResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy chi tiết đơn hàng theo ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<DonHangResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DonHangResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var donHang = await _donHangService.GetDonHangFullInfoAsync(id);
            if (donHang == null)
            {
                return NotFound(ApiResponse<DonHangResponse>.ErrorResponse("Không tìm thấy đơn hàng"));
            }

            var response = _mapper.Map<DonHangResponse>(donHang);
            return Ok(ApiResponse<DonHangResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy đơn hàng theo trạng thái (Admin)
        /// </summary>
        [HttpGet("status/{trangThai}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DonHangResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByStatus(string trangThai)
        {
            var donHangs = await _donHangService.GetDonHangsByTrangThaiAsync(trangThai);
            var response = _mapper.Map<IEnumerable<DonHangResponse>>(donHangs);
            return Ok(ApiResponse<IEnumerable<DonHangResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Tạo đơn hàng từ giỏ hàng (Checkout)
        /// </summary>
        [HttpPost("checkout")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<DonHangResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DonHangResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Checkout([FromBody] CreateDonHangRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<DonHangResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<DonHangResponse>.ErrorResponse("Không xác định được người dùng"));
            }

            try
            {
                // Tạo đơn hàng từ giỏ hàng (bao gồm tạo thanh toán trong cùng transaction)
                var donHang = await _donHangService.CreateFromGioHangAsync(nguoiDungId, request.DiaChiGiaoHang, request.PhuongThucThanhToan, request.VoucherCode, request.GioHangChiTietIds);

                // Lấy đơn hàng với đầy đủ thông tin
                var fullDonHang = await _donHangService.GetDonHangFullInfoAsync(donHang.DonHangId);
                var response = _mapper.Map<DonHangResponse>(fullDonHang);

                return CreatedAtAction(nameof(GetById), new { id = donHang.DonHangId },
                    ApiResponse<DonHangResponse>.SuccessResponse(response, "Đặt hàng thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<DonHangResponse>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Tạo đơn hàng trực tiếp (Mua ngay - không qua giỏ hàng)
        /// </summary>
        [HttpPost("checkout-direct")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<DonHangResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DonHangResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CheckoutDirect([FromBody] CreateDonHangDirectRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<DonHangResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var nguoiDungId = GetCurrentUserId();
            if (nguoiDungId == 0)
            {
                return Unauthorized(ApiResponse<DonHangResponse>.ErrorResponse("Không xác định được người dùng"));
            }

            if (request.OrderItems == null || !request.OrderItems.Any())
            {
                return BadRequest(ApiResponse<DonHangResponse>.ErrorResponse("Danh sách sản phẩm trống"));
            }

            try
            {
                // Chuyển đổi OrderItems sang định dạng phù hợp
                var items = request.OrderItems.Select(item => 
                    (item.SanPhamChiTietId, item.SoLuong, item.DonGia)
                ).ToList();

                // Tạo đơn hàng trực tiếp (bao gồm tạo thanh toán trong cùng transaction)
                var donHang = await _donHangService.CreateDirectAsync(nguoiDungId, request.DiaChiGiaoHang, items, request.PhuongThucThanhToan, request.VoucherCode);

                // Lấy đơn hàng với đầy đủ thông tin
                var fullDonHang = await _donHangService.GetDonHangFullInfoAsync(donHang.DonHangId);
                var response = _mapper.Map<DonHangResponse>(fullDonHang);

                return CreatedAtAction(nameof(GetById), new { id = donHang.DonHangId },
                    ApiResponse<DonHangResponse>.SuccessResponse(response, "Đặt hàng thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<DonHangResponse>.ErrorResponse(ex.Message));
            }
        }

        /// <summary>
        /// Cập nhật trạng thái đơn hàng (Admin)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateDonHangTrangThaiRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var result = await _donHangService.UpdateTrangThaiAsync(id, request.TrangThai);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy đơn hàng"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật trạng thái đơn hàng thành công"));
        }

        /// <summary>
        /// Hủy đơn hàng
        /// </summary>
        [HttpPatch("{id}/cancel")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var donHang = await _donHangService.GetByIdAsync(id);
            if (donHang == null)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy đơn hàng"));
            }

            // Chỉ cho phép hủy đơn hàng ở trạng thái "ChoXuLy"
            if (donHang.TrangThai != "ChoXuLy")
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse("Không thể hủy đơn hàng ở trạng thái này"));
            }

            var result = await _donHangService.UpdateTrangThaiAsync(id, "DaHuy");
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã hủy đơn hàng"));
        }

        /// <summary>
        /// Xóa đơn hàng (Admin)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _donHangService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy đơn hàng"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa đơn hàng thành công"));
        }
    }
}
