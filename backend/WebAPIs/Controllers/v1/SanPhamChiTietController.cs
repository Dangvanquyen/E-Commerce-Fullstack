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
    public class SanPhamChiTietController : ControllerBase
    {
        private readonly ISanPhamChiTietService _sanPhamChiTietService;
        private readonly IMapper _mapper;

        public SanPhamChiTietController(
            ISanPhamChiTietService sanPhamChiTietService,
            IMapper mapper)
        {
            _sanPhamChiTietService = sanPhamChiTietService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy tất cả chi tiết sản phẩm
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamChiTietResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var chiTiets = await _sanPhamChiTietService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<SanPhamChiTietResponse>>(chiTiets);
            return Ok(ApiResponse<IEnumerable<SanPhamChiTietResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách chi tiết sản phẩm có phân trang, tìm kiếm và lọc
        /// </summary>
        [HttpGet("paged")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<SanPhamChiTietResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? danhMucId = null,
            [FromQuery] string? stockStatus = null,
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _sanPhamChiTietService.GetPagedInventoryAsync(searchTerm, danhMucId, stockStatus, pageNumber, pageSize);
            var response = new PagedResponse<SanPhamChiTietResponse>
            {
                Items = _mapper.Map<IEnumerable<SanPhamChiTietResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<SanPhamChiTietResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy thống kê kho hàng (yêu cầu vai trò Admin)
        /// </summary>
        [HttpGet("inventory-stats")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<InventoryStatsResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetInventoryStats()
        {
            var stats = await _sanPhamChiTietService.GetInventoryStatsAsync();
            return Ok(ApiResponse<InventoryStatsResponse>.SuccessResponse(stats));
        }

        /// <summary>
        /// Lấy chi tiết sản phẩm theo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var chiTiet = await _sanPhamChiTietService.GetChiTietWithSanPhamAsync(id);
            if (chiTiet == null)
            {
                return NotFound(ApiResponse<SanPhamChiTietResponse>.ErrorResponse("Không tìm thấy chi tiết sản phẩm"));
            }

            var response = _mapper.Map<SanPhamChiTietResponse>(chiTiet);
            return Ok(ApiResponse<SanPhamChiTietResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách chi tiết theo sản phẩm
        /// </summary>
        [HttpGet("sanpham/{sanPhamId}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamChiTietResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetBySanPham(int sanPhamId)
        {
            var chiTiets = await _sanPhamChiTietService.GetChiTietsBySanPhamAsync(sanPhamId);
            var response = _mapper.Map<IEnumerable<SanPhamChiTietResponse>>(chiTiets);
            return Ok(ApiResponse<IEnumerable<SanPhamChiTietResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách chi tiết còn hàng theo sản phẩm
        /// </summary>
        [HttpGet("sanpham/{sanPhamId}/available")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamChiTietResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAvailableBySanPham(int sanPhamId)
        {
            var chiTiets = await _sanPhamChiTietService.GetAvailableChiTietsAsync(sanPhamId);
            var response = _mapper.Map<IEnumerable<SanPhamChiTietResponse>>(chiTiets);
            return Ok(ApiResponse<IEnumerable<SanPhamChiTietResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Tìm chi tiết sản phẩm theo size và màu sắc
        /// </summary>
        [HttpGet("sanpham/{sanPhamId}/variant")]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByVariant(int sanPhamId, [FromQuery] string size, [FromQuery] string mauSac)
        {
            var chiTiet = await _sanPhamChiTietService.GetBySizeAndMauSacAsync(sanPhamId, size, mauSac);
            if (chiTiet == null)
            {
                return NotFound(ApiResponse<SanPhamChiTietResponse>.ErrorResponse("Không tìm thấy biến thể sản phẩm"));
            }

            var response = _mapper.Map<SanPhamChiTietResponse>(chiTiet);
            return Ok(ApiResponse<SanPhamChiTietResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Tạo chi tiết sản phẩm mới (yêu cầu đăng nhập)
        /// </summary>
        [HttpPost]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateSanPhamChiTietRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<SanPhamChiTietResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var chiTiet = _mapper.Map<SanPhamChiTiet>(request);
            var created = await _sanPhamChiTietService.CreateAsync(chiTiet);
            var response = _mapper.Map<SanPhamChiTietResponse>(created);

            return CreatedAtAction(nameof(GetById), new { id = created.SanPhamChiTietId },
                ApiResponse<SanPhamChiTietResponse>.SuccessResponse(response, "Tạo chi tiết sản phẩm thành công"));
        }

        /// <summary>
        /// Cập nhật chi tiết sản phẩm (yêu cầu đăng nhập)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamChiTietResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSanPhamChiTietRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<SanPhamChiTietResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var chiTiet = _mapper.Map<SanPhamChiTiet>(request);
            var updated = await _sanPhamChiTietService.UpdateAsync(id, chiTiet);

            if (updated == null)
            {
                return NotFound(ApiResponse<SanPhamChiTietResponse>.ErrorResponse("Không tìm thấy chi tiết sản phẩm"));
            }

            var response = _mapper.Map<SanPhamChiTietResponse>(updated);
            return Ok(ApiResponse<SanPhamChiTietResponse>.SuccessResponse(response, "Cập nhật chi tiết sản phẩm thành công"));
        }

        /// <summary>
        /// Cập nhật số lượng tồn kho (yêu cầu đăng nhập)
        /// </summary>
        [HttpPatch("{id}/inventory")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateInventory(int id, [FromQuery] int soLuong)
        {
            var result = await _sanPhamChiTietService.UpdateSoLuongTonAsync(id, soLuong);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy chi tiết sản phẩm"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật số lượng tồn kho thành công"));
        }

        /// <summary>
        /// Xóa chi tiết sản phẩm (yêu cầu đăng nhập)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _sanPhamChiTietService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy chi tiết sản phẩm"));
            }

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa chi tiết sản phẩm thành công"));
        }
    }
}
