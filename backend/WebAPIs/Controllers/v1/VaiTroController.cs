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
    public class VaiTroController : ControllerBase
    {
        private readonly IVaiTroService _vaiTroService;
        private readonly IMapper _mapper;

        public VaiTroController(IVaiTroService vaiTroService, IMapper mapper)
        {
            _vaiTroService = vaiTroService;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<VaiTroResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var vaiTros = await _vaiTroService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<VaiTroResponse>>(vaiTros);
            return Ok(ApiResponse<IEnumerable<VaiTroResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<VaiTroResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<VaiTroResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var vaiTro = await _vaiTroService.GetByIdAsync(id);
            if (vaiTro == null)
            {
                return NotFound(ApiResponse<VaiTroResponse>.ErrorResponse("Không tìm thấy vai trò"));
            }
            var response = _mapper.Map<VaiTroResponse>(vaiTro);
            return Ok(ApiResponse<VaiTroResponse>.SuccessResponse(response));
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<VaiTroResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<VaiTroResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateVaiTroRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<VaiTroResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var existing = await _vaiTroService.GetByTenVaiTroAsync(request.TenVaiTro);
            if (existing != null)
            {
                return BadRequest(ApiResponse<VaiTroResponse>.ErrorResponse("Tên vai trò đã tồn tại"));
            }

            var vaiTro = _mapper.Map<VaiTro>(request);
            var created = await _vaiTroService.CreateAsync(vaiTro);
            var response = _mapper.Map<VaiTroResponse>(created);

            return CreatedAtAction(nameof(GetById), new { id = created.VaiTroId },
                ApiResponse<VaiTroResponse>.SuccessResponse(response, "Tạo vai trò thành công"));
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<VaiTroResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<VaiTroResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVaiTroRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<VaiTroResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var vaiTro = _mapper.Map<VaiTro>(request);
            var updated = await _vaiTroService.UpdateAsync(id, vaiTro);

            if (updated == null)
            {
                return NotFound(ApiResponse<VaiTroResponse>.ErrorResponse("Không tìm thấy vai trò"));
            }

            var response = _mapper.Map<VaiTroResponse>(updated);
            return Ok(ApiResponse<VaiTroResponse>.SuccessResponse(response, "Cập nhật vai trò thành công"));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _vaiTroService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy vai trò"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa vai trò thành công"));
        }
    }
}
