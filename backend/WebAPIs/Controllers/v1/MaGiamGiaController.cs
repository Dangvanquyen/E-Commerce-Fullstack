using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class MaGiamGiaController : ControllerBase
    {
        private readonly IMaGiamGiaService _maGiamGiaService;
        private readonly IMapper _mapper;

        public MaGiamGiaController(IMaGiamGiaService maGiamGiaService, IMapper mapper)
        {
            _maGiamGiaService = maGiamGiaService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy tất cả các mã giảm giá (Admin)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<MaGiamGiaResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll()
        {
            var vouchers = await _maGiamGiaService.GetAllAsync();
            var response = _mapper.Map<IEnumerable<MaGiamGiaResponse>>(vouchers);
            return Ok(ApiResponse<IEnumerable<MaGiamGiaResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách các mã giảm giá có phân trang (Admin)
        /// </summary>
        [HttpGet("paged")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<MaGiamGiaResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var (items, totalCount) = await _maGiamGiaService.GetPagedAsync(pageNumber, pageSize);
            var response = new PagedResponse<MaGiamGiaResponse>
            {
                Items = _mapper.Map<IEnumerable<MaGiamGiaResponse>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            return Ok(ApiResponse<PagedResponse<MaGiamGiaResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy danh sách các mã giảm giá đang hoạt động (Public / Shop Checkout)
        /// </summary>
        [HttpGet("active")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<MaGiamGiaResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActive()
        {
            var activeVouchers = await _maGiamGiaService.GetActiveVouchersAsync();
            var response = _mapper.Map<IEnumerable<MaGiamGiaResponse>>(activeVouchers);
            return Ok(ApiResponse<IEnumerable<MaGiamGiaResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Lấy thông tin mã giảm giá theo ID (Admin)
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<MaGiamGiaResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<MaGiamGiaResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var voucher = await _maGiamGiaService.GetByIdAsync(id);
            if (voucher == null)
            {
                return NotFound(ApiResponse<MaGiamGiaResponse>.ErrorResponse("Không tìm thấy mã giảm giá"));
            }
            var response = _mapper.Map<MaGiamGiaResponse>(voucher);
            return Ok(ApiResponse<MaGiamGiaResponse>.SuccessResponse(response));
        }

        /// <summary>
        /// Tạo mới mã giảm giá (Admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<MaGiamGiaResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<MaGiamGiaResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateMaGiamGiaRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<MaGiamGiaResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var checkCode = await _maGiamGiaService.GetByCodeAsync(request.Code.Trim().ToUpper());
            if (checkCode != null)
            {
                return BadRequest(ApiResponse<MaGiamGiaResponse>.ErrorResponse("Mã giảm giá đã tồn tại trong hệ thống"));
            }

            var voucher = _mapper.Map<MaGiamGia>(request);
            voucher.Code = request.Code.Trim().ToUpper();
            var created = await _maGiamGiaService.CreateAsync(voucher);
            var response = _mapper.Map<MaGiamGiaResponse>(created);

            return CreatedAtAction(nameof(GetById), new { id = created.MaGiamGiaId }, 
                ApiResponse<MaGiamGiaResponse>.SuccessResponse(response, "Tạo mã giảm giá thành công"));
        }

        /// <summary>
        /// Cập nhật mã giảm giá (Admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<MaGiamGiaResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<MaGiamGiaResponse>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMaGiamGiaRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<MaGiamGiaResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var checkCode = await _maGiamGiaService.GetByCodeAsync(request.Code.Trim().ToUpper());
            if (checkCode != null && checkCode.MaGiamGiaId != id)
            {
                return BadRequest(ApiResponse<MaGiamGiaResponse>.ErrorResponse("Mã giảm giá đã trùng với mã khác"));
            }

            var voucher = _mapper.Map<MaGiamGia>(request);
            voucher.Code = request.Code.Trim().ToUpper();
            var updated = await _maGiamGiaService.UpdateAsync(id, voucher);

            if (updated == null)
            {
                return NotFound(ApiResponse<MaGiamGiaResponse>.ErrorResponse("Không tìm thấy mã giảm giá"));
            }

            var response = _mapper.Map<MaGiamGiaResponse>(updated);
            return Ok(ApiResponse<MaGiamGiaResponse>.SuccessResponse(response, "Cập nhật mã giảm giá thành công"));
        }

        /// <summary>
        /// Xóa mã giảm giá (Admin)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _maGiamGiaService.DeleteAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy mã giảm giá"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa mã giảm giá thành công"));
        }

        /// <summary>
        /// Cập nhật trạng thái hoạt động của mã giảm giá (Admin)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] bool trangThai)
        {
            var result = await _maGiamGiaService.UpdateTrangThaiAsync(id, trangThai);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse("Không tìm thấy mã giảm giá"));
            }
            return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật trạng thái thành công"));
        }

        /// <summary>
        /// Kiểm tra và tính toán giảm giá của voucher đối với đơn hàng (User)
        /// </summary>
        [HttpPost("validate")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<ValidateVoucherResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<ValidateVoucherResponse>.ErrorResponse("Dữ liệu không hợp lệ"));
            }

            var (isValid, discountAmount, message) = await _maGiamGiaService.ValidateVoucherAsync(request.Code, request.OrderAmount);
            
            var response = new ValidateVoucherResponse
            {
                Code = request.Code.Trim().ToUpper(),
                IsValid = isValid,
                DiscountAmount = discountAmount,
                Message = message
            };

            if (!isValid)
            {
                return Ok(ApiResponse<ValidateVoucherResponse>.SuccessResponse(response, message));
            }

            return Ok(ApiResponse<ValidateVoucherResponse>.SuccessResponse(response, "Áp dụng mã giảm giá thành công"));
        }
    }
}
