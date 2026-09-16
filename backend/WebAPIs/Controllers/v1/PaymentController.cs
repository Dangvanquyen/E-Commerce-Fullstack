using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;

        public PaymentController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        /// <summary>
        /// Tạo URL thanh toán VNPay
        /// </summary>
        [HttpPost("create-payment-url")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public IActionResult CreatePaymentUrl([FromBody] PaymentInformationModel model)
        {
            try
            {
                var url = _vnPayService.CreatePaymentUrl(model, HttpContext);
                return Ok(ApiResponse<string>.SuccessResponse(url, "Tạo URL thanh toán thành công"));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Callback từ VNPay sau khi thanh toán
        /// </summary>
        [HttpGet("payment-callback")]
        [ProducesResponseType(typeof(ApiResponse<PaymentResponseModel>), StatusCodes.Status200OK)]
        public IActionResult PaymentCallback()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);
            
            if (response.Success)
            {
                return Ok(ApiResponse<PaymentResponseModel>.SuccessResponse(response, "Thanh toán thành công"));
            }
            
            return Ok(ApiResponse<PaymentResponseModel>.ErrorResponse("Thanh toán thất bại"));
        }
    }
}
