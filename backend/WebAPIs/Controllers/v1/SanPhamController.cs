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
    public class SanPhamController : ControllerBase
    {
        private readonly ISanPhamService _sanPhamService;
        private readonly IMapper _mapper;

        public SanPhamController(ISanPhamService sanPhamService, IMapper mapper)
        {
            _sanPhamService = sanPhamService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách tất cả sản phẩm
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var sanPhams = await _sanPhamService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<SanPhamResponse>>(sanPhams);
            return Ok(ApiResponse<IEnumerable<SanPhamResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách sản phẩm đang hoạt động
        /// </summary>
        [HttpGet("active")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActive()
        {
            var sanPhams = await _sanPhamService.GetActiveSanPhamsAsync();
            var response = _mapper.Map<IEnumerable<SanPhamResponse>>(sanPhams);
            return Ok(ApiResponse<IEnumerable<SanPhamResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách sản phẩm có phân trang
        /// </summary>
        [HttpGet("paged")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<SanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _sanPhamService.GetPagedAsync(pageNumber, pageSize);
            var response = new PagedResponse<SanPhamResponse>
            {
                Items = _mapper.Map<IEnumerable<SanPhamResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<SanPhamResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy thông tin sản phẩm theo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SanPhamResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var sanPham = await _sanPhamService.GetSanPhamWithFullDetailsAsync(id);
            if (sanPham == null)
            {
                return NotFound(ApiResponse<SanPhamResponse>.ErrorResponse("Không tìm thấy sản phẩm"));
            }
            var response = _mapper.Map<SanPhamResponse>(sanPham);
            return Ok(ApiResponse<SanPhamResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách sản phẩm theo danh mục
        /// </summary>
        [HttpGet("danhmuc/{danhMucId}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByDanhMuc(int danhMucId)
        {
            var sanPhams = await _sanPhamService.GetSanPhamsByDanhMucAsync(danhMucId);
            var response = _mapper.Map<IEnumerable<SanPhamResponse>>(sanPhams);
            return Ok(ApiResponse<IEnumerable<SanPhamResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Tìm kiếm sản phẩm theo từ khóa
        /// </summary>
        [HttpGet("search")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest(ApiResponse<IEnumerable<SanPhamResponse>>.ErrorResponse("Từ khóa tìm kiếm không được để trống"));
            }
            var sanPhams = await _sanPhamService.SearchSanPhamsAsync(keyword);
            var response = _mapper.Map<IEnumerable<SanPhamResponse>>(sanPhams);
            return Ok(ApiResponse<IEnumerable<SanPhamResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Tạo sản phẩm mới (Admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<SanPhamResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateSanPhamRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<SanPhamResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var sanPham = _mapper.Map<SanPham>(request);
            var created = await _sanPhamService.CreateAsync(sanPham);
            var response = _mapper.Map<SanPhamResponse>(created);

            return CreatedAtAction(nameof(GetById), new { id = created.SanPhamId }, 
                ApiResponse<SanPhamResponse>.SuccessResponse(response, "Tạo sản phẩm thành công"));
        }

        /// <summary>
        /// Cập nhật sản phẩm (Admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<SanPhamResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SanPhamResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSanPhamRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<SanPhamResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var sanPham = _mapper.Map<SanPham>(request);
            var updated = await _sanPhamService.UpdateAsync(id, sanPham);

            if (updated == null)
            {
                return NotFound(ApiResponse<SanPhamResponse>.ErrorResponse("Không tìm thấy sản phẩm"));
            }

            var response = _mapper.Map<SanPhamResponse>(updated);
            return Ok(ApiResponse<SanPhamResponse>.SuccessResponse(response, "Cập nhật sản phẩm thành công"));
        }

        /// <summary>
        /// Xóa sản phẩm (Admin)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _sanPhamService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy sản phẩm"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa sản phẩm thành công"));
        }

        /// <summary>
        /// Cập nhật trạng thái sản phẩm (Admin)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool trangThai)
        {
            var result = await _sanPhamService.UpdateTrangThaiAsync(id, trangThai);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy sản phẩm"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật trạng thái thành công"));
        }
    }
}
