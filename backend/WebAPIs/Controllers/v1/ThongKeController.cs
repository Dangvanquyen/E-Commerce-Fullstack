using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class ThongKeController : ControllerBase
    {
        private readonly IThongKeService _thongKeService;

        public ThongKeController(IThongKeService thongKeService)
        {
            _thongKeService = thongKeService;
        }

        // ==========================================
        // THỐNG KÊ DOANH THU (Admin only)
        // ==========================================

        /// <summary>Tổng quan thống kê</summary>
        [HttpGet("tong-quan")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<ThongKeTongQuanResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTongQuan()
        {
            var data = await _thongKeService.GetTongQuanAsync();
            return Ok(ApiResponse<ThongKeTongQuanResponse>.SuccessResponse(data));
        }

        /// <summary>
        /// Doanh thu theo tháng trong năm
        /// </summary>
        [HttpGet("doanh-thu/thang")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DoanhThuKyResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDoanhThuTheoThang([FromQuery] int nam)
        {
            if (nam <= 0) nam = DateTime.Now.Year;
            var data = await _thongKeService.GetDoanhThuTheoThangAsync(nam);
            return Ok(ApiResponse<IEnumerable<DoanhThuKyResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Doanh thu theo quý trong năm
        /// </summary>
        [HttpGet("doanh-thu/quy")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DoanhThuKyResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDoanhThuTheoQuy([FromQuery] int nam)
        {
            if (nam <= 0) nam = DateTime.Now.Year;
            var data = await _thongKeService.GetDoanhThuTheoQuyAsync(nam);
            return Ok(ApiResponse<IEnumerable<DoanhThuKyResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Doanh thu theo năm
        /// </summary>
        [HttpGet("doanh-thu/nam")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DoanhThuKyResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDoanhThuTheoNam([FromQuery] int tuNam, [FromQuery] int denNam)
        {
            if (tuNam <= 0) tuNam = DateTime.Now.Year - 4;
            if (denNam <= 0) denNam = DateTime.Now.Year;
            if (tuNam > denNam) (tuNam, denNam) = (denNam, tuNam);

            var data = await _thongKeService.GetDoanhThuTheoNamAsync(tuNam, denNam);
            return Ok(ApiResponse<IEnumerable<DoanhThuKyResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Doanh thu theo sản phẩm
        /// </summary>
        [HttpGet("doanh-thu/san-pham")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DoanhThuSanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDoanhThuTheoSanPham(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] int top = 20)
        {
            var data = await _thongKeService.GetDoanhThuTheoSanPhamAsync(tuNgay, denNgay, top);
            return Ok(ApiResponse<IEnumerable<DoanhThuSanPhamResponse>>.SuccessResponse(data));
        }

        /// <summary>
        /// Doanh thu theo danh mục
        /// </summary>
        [HttpGet("doanh-thu/danh-muc")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DoanhThuDanhMucResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDoanhThuTheoDanhMuc(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay)
        {
            var data = await _thongKeService.GetDoanhThuTheoDanhMucAsync(tuNgay, denNgay);
            return Ok(ApiResponse<IEnumerable<DoanhThuDanhMucResponse>>.SuccessResponse(data));
        }

        // ==========================================
        // TRACKING HÀNH VI KHÁCH HÀNG
        // ==========================================

        /// <summary>
        /// Ghi nhận lượt click vào sản phẩm
        /// </summary>
        [HttpPost("click")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<GhiNhanClickResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GhiNhanClick([FromBody] GhiNhanClickRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<GhiNhanClickResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            // Lấy IP & User-Agent từ context
            request.IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            request.UserAgent = Request.Headers["User-Agent"].ToString();

            var lichSuId = await _thongKeService.GhiNhanClickAsync(request);
            var result = new GhiNhanClickResponse { LichSuId = lichSuId };

            return Ok(ApiResponse<GhiNhanClickResponse>.SuccessResponse(result));
        }

        /// <summary>
        /// Cập nhật thời gian xem sản phẩm (gọi từ unmount / sendBeacon)
        /// </summary>
        [HttpPost("thoi-gian-xem")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> CapNhatThoiGianXem([FromBody] CapNhatThoiGianXemRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            await _thongKeService.CapNhatThoiGianXemAsync(request.LichSuId, request.Giay);
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật thời gian xem thành công"));
        }

        /// <summary>
        /// Thống kê top click / hành vi duyệt web (Admin only)
        /// </summary>
        [HttpGet("click/san-pham")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ThongKeClickSanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTopClickSanPham(
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] int top = 20)
        {
            var data = await _thongKeService.GetTopClickSanPhamAsync(tuNgay, denNgay, top);
            return Ok(ApiResponse<IEnumerable<ThongKeClickSanPhamResponse>>.SuccessResponse(data));
        }
    }
}
