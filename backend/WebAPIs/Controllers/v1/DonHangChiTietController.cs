using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class DonHangChiTietController : ControllerBase
    {
        private readonly IDonHangChiTietService _donHangChiTietService;
        private readonly IMapper _mapper;

        public DonHangChiTietController(
            IDonHangChiTietService donHangChiTietService,
            IMapper mapper)
        {
            _donHangChiTietService = donHangChiTietService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy tất cả chi tiết của một đơn hàng
        /// </summary>
        [HttpGet("donhang/{donHangId}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DonHangChiTietResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByDonHang(int donHangId)
        {
            var chiTiets = await _donHangChiTietService.GetChiTietsByDonHangAsync(donHangId);
            var response = _mapper.Map<IEnumerable<DonHangChiTietResponse>>(chiTiets);
            return Ok(ApiResponse<IEnumerable<DonHangChiTietResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy chi tiết đơn hàng theo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DonHangChiTietResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DonHangChiTietResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var chiTiet = await _donHangChiTietService.GetChiTietWithSanPhamInfoAsync(id);
            if (chiTiet == null)
            {
                return NotFound(ApiResponse<DonHangChiTietResponse>.ErrorResponse("Không tìm thấy chi tiết đơn hàng"));
            }

            var response = _mapper.Map<DonHangChiTietResponse>(chiTiet);
            return Ok(ApiResponse<DonHangChiTietResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy tổng tiền của đơn hàng
        /// </summary>
        [HttpGet("donhang/{donHangId}/tongtien")]
        [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTotalByDonHang(int donHangId)
        {
            var tongTien = await _donHangChiTietService.GetTongTienByDonHangAsync(donHangId);
            return Ok(ApiResponse<decimal>.SuccessResponse(tongTien));
        }
    }
}
