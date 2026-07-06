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
    public class DanhMucController : ControllerBase
    {
        private readonly IDanhMucService _danhMucService;
        private readonly IMapper _mapper;

        public DanhMucController(IDanhMucService danhMucService, IMapper mapper)
        {
            _danhMucService = danhMucService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách tất cả danh mục
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DanhMucResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var danhMucs = await _danhMucService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<DanhMucResponse>>(danhMucs);
            return Ok(ApiResponse<IEnumerable<DanhMucResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách danh mục đang hoạt động
        /// </summary>
        [HttpGet("active")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DanhMucResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActive()
        {
            var danhMucs = await _danhMucService.GetActiveDanhMucsAsync();
            var response = _mapper.Map<IEnumerable<DanhMucResponse>>(danhMucs);
            return Ok(ApiResponse<IEnumerable<DanhMucResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách danh mục có phân trang
        /// </summary>
        [HttpGet("paged")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<DanhMucResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _danhMucService.GetPagedAsync(pageNumber, pageSize);
            var response = new PagedResponse<DanhMucResponse>
            {
                Items = _mapper.Map<IEnumerable<DanhMucResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<DanhMucResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy thông tin danh mục theo ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var danhMuc = await _danhMucService.GetByIdAsync(id);
            if (danhMuc == null)
            {
                return NotFound(ApiResponse<DanhMucResponse>.ErrorResponse("Không tìm thấy danh mục"));
            }
            var response = _mapper.Map<DanhMucResponse>(danhMuc);
            return Ok(ApiResponse<DanhMucResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh mục kèm sản phẩm
        /// </summary>
        [HttpGet("{id}/sanphams")]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWithSanPhams(int id)
        {
            var danhMuc = await _danhMucService.GetDanhMucWithSanPhamsAsync(id);
            if (danhMuc == null)
            {
                return NotFound(ApiResponse<DanhMucResponse>.ErrorResponse("Không tìm thấy danh mục"));
            }
            var response = _mapper.Map<DanhMucResponse>(danhMuc);
            return Ok(ApiResponse<DanhMucResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Tạo danh mục mới (Admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateDanhMucRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<DanhMucResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            // Check if name already exists
            var existing = await _danhMucService.GetByTenDanhMucAsync(request.TenDanhMuc);
            if (existing != null)
            {
                return BadRequest(ApiResponse<DanhMucResponse>.ErrorResponse("Tên danh mục đã tồn tại"));
            }

            var danhMuc = _mapper.Map<DanhMuc>(request);
            var created = await _danhMucService.CreateAsync(danhMuc);
            var response = _mapper.Map<DanhMucResponse>(created);

            return CreatedAtAction(nameof(GetById), new { id = created.DanhMucId },
                ApiResponse<DanhMucResponse>.SuccessResponse(response, "Tạo danh mục thành công"));
        }

        /// <summary>
        /// Cập nhật danh mục (Admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DanhMucResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDanhMucRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<DanhMucResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var danhMuc = _mapper.Map<DanhMuc>(request);
            var updated = await _danhMucService.UpdateAsync(id, danhMuc);

            if (updated == null)
            {
                return NotFound(ApiResponse<DanhMucResponse>.ErrorResponse("Không tìm thấy danh mục"));
            }

            var response = _mapper.Map<DanhMucResponse>(updated);
            return Ok(ApiResponse<DanhMucResponse>.SuccessResponse(response, "Cập nhật danh mục thành công"));
        }

        /// <summary>
        /// Xóa danh mục (Admin)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _danhMucService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy danh mục"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa danh mục thành công"));
        }

        /// <summary>
        /// Cập nhật trạng thái danh mục (Admin)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool trangThai)
        {
            var result = await _danhMucService.UpdateTrangThaiAsync(id, trangThai);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy danh mục"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật trạng thái thành công"));
        }
    }
}
