using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class ThanhToanController : ControllerBase
    {
        private readonly IThanhToanService _thanhToanService;
        private readonly IMapper _mapper;

        public ThanhToanController(
            IThanhToanService thanhToanService,
            IMapper mapper)
        {
            _thanhToanService = thanhToanService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy thông tin thanh toán theo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ThanhToanResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<ThanhToanResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var thanhToan = await _thanhToanService.GetByIdAsync(id);
            if (thanhToan == null)
            {
                return NotFound(ApiResponse<ThanhToanResponse>.ErrorResponse("Không tìm thấy thông tin thanh toán"));
            }

            var response = _mapper.Map<ThanhToanResponse>(thanhToan);
            return Ok(ApiResponse<ThanhToanResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy thông tin thanh toán theo đơn hàng
        /// </summary>
        [HttpGet("donhang/{donHangId}")]
        [ProducesResponseType(typeof(ApiResponse<ThanhToanResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<ThanhToanResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByDonHang(int donHangId)
        {
            var thanhToan = await _thanhToanService.GetThanhToanByDonHangAsync(donHangId);
            if (thanhToan == null)
            {
                return NotFound(ApiResponse<ThanhToanResponse>.ErrorResponse("Không tìm thấy thông tin thanh toán cho đơn hàng này"));
            }

            var response = _mapper.Map<ThanhToanResponse>(thanhToan);
            return Ok(ApiResponse<ThanhToanResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách thanh toán theo trạng thái (Admin)
        /// </summary>
        [HttpGet("status/{trangThai}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ThanhToanResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByStatus(string trangThai)
        {
            var thanhToans = await _thanhToanService.GetThanhToansByTrangThaiAsync(trangThai);
            var response = _mapper.Map<IEnumerable<ThanhToanResponse>>(thanhToans);
            return Ok(ApiResponse<IEnumerable<ThanhToanResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách thanh toán theo phương thức (Admin)
        /// </summary>
        [HttpGet("phuongthuc/{phuongThuc}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ThanhToanResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByPhuongThuc(string phuongThuc)
        {
            var thanhToans = await _thanhToanService.GetThanhToansByPhuongThucAsync(phuongThuc);
            var response = _mapper.Map<IEnumerable<ThanhToanResponse>>(thanhToans);
            return Ok(ApiResponse<IEnumerable<ThanhToanResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Cập nhật trạng thái thanh toán (Admin)
        /// </summary>
        [HttpPatch("{id}/status")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateThanhToanRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var result = await _thanhToanService.UpdateTrangThaiAsync(id, request.TrangThai);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy thông tin thanh toán"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật trạng thái thanh toán thành công"));
        }

        /// <summary>
        /// Xác nhận thanh toán thành công
        /// </summary>
        [HttpPatch("{id}/confirm")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            var result = await _thanhToanService.UpdateTrangThaiAsync(id, "DaThanhToan");
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy thông tin thanh toán"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xác nhận thanh toán thành công"));
        }
    }
}
