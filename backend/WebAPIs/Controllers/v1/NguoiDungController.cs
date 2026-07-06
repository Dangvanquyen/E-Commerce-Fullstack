using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Linq;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungService _nguoiDungService;
        private readonly IMapper _mapper;

        public NguoiDungController(INguoiDungService nguoiDungService, IMapper mapper)
        {
            _nguoiDungService = nguoiDungService;
            _mapper = mapper;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<NguoiDungResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var nguoiDungs = await _nguoiDungService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<NguoiDungResponse>>(nguoiDungs);
            return Ok(ApiResponse<IEnumerable<NguoiDungResponse>>.SuccessResponse(response));
        }

        [HttpGet("paged")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<NguoiDungResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _nguoiDungService.GetPagedAsync(pageNumber, pageSize);
            var response = new PagedResponse<NguoiDungResponse>
            {
                Items = _mapper.Map<IEnumerable<NguoiDungResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<NguoiDungResponse>>.SuccessResponse(response));
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<NguoiDungResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<NguoiDungResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");
            if (id != currentUserId && !isAdmin)
            {
                return Forbid();
            }

            var nguoiDung = await _nguoiDungService.GetNguoiDungWithVaiTroAsync(id);
            if (nguoiDung == null)
            {
                return NotFound(ApiResponse<NguoiDungResponse>.ErrorResponse("Không tìm thấy người dùng"));
            }
            var response = _mapper.Map<NguoiDungResponse>(nguoiDung);
            return Ok(ApiResponse<NguoiDungResponse>.SuccessResponse(response));
        }

        [HttpGet("vaitro/{vaiTroId}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<NguoiDungResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByVaiTro(int vaiTroId)
        {
            var nguoiDungs = await _nguoiDungService.GetNguoiDungsByVaiTroAsync(vaiTroId);
            var response = _mapper.Map<IEnumerable<NguoiDungResponse>>(nguoiDungs);
            return Ok(ApiResponse<IEnumerable<NguoiDungResponse>>.SuccessResponse(response));
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<NguoiDungResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<NguoiDungResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNguoiDungRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<NguoiDungResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var isAdmin = User.IsInRole("Admin");
            if (id != currentUserId && !isAdmin)
            {
                return Forbid();
            }

            var existingUser = await _nguoiDungService.GetByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound(ApiResponse<NguoiDungResponse>.ErrorResponse("Không tìm thấy người dùng"));
            }

            var nguoiDung = _mapper.Map<NguoiDung>(request);
            if (!isAdmin)
            {
                // Force original role and status for non-admin updates
                nguoiDung.VaiTroId = existingUser.VaiTroId;
                nguoiDung.TrangThai = existingUser.TrangThai;
            }

            var updated = await _nguoiDungService.UpdateAsync(id, nguoiDung);

            if (updated == null)
            {
                return NotFound(ApiResponse<NguoiDungResponse>.ErrorResponse("Không tìm thấy người dùng"));
            }

            var response = _mapper.Map<NguoiDungResponse>(updated);
            return Ok(ApiResponse<NguoiDungResponse>.SuccessResponse(response, "Cập nhật người dùng thành công"));
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool trangThai)
        {
            var result = await _nguoiDungService.UpdateTrangThaiAsync(id, trangThai);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật trạng thái thành công"));
        }

        [HttpPatch("{id}/role")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateRole(int id, [FromQuery] int vaiTroId)
        {
            var result = await _nguoiDungService.UpdateVaiTroAsync(id, vaiTroId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật vai trò thành công"));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _nguoiDungService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa người dùng thành công"));
        }

        [HttpPost("upload-avatar")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Không nhận được file ảnh."));
            }

            // Kiểm tra định dạng file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Định dạng file không hỗ trợ. Chỉ cho phép các định dạng: .jpg, .jpeg, .png, .gif, .webp."));
            }

            // Kiểm tra kích thước file (tối đa 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Dung lượng file vượt quá giới hạn 5MB."));
            }

            try
            {
                // Thư mục lưu trữ trong wwwroot
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Đặt tên file duy nhất
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Tạo URL trả về cho client
                var host = Request.Host.Value;
                var protocol = Request.Scheme;
                var fileUrl = $"{protocol}://{host}/uploads/avatars/{fileName}";

                return Ok(ApiResponse<string>.SuccessResponse(fileUrl, "Tải ảnh lên thành công."));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    ApiResponse<string>.ErrorResponse($"Lỗi khi tải ảnh lên server: {ex.Message}"));
            }
        }
    }
}
