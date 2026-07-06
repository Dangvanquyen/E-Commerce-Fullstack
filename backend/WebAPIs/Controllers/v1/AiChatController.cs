using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class AiChatController : ControllerBase
    {
        private readonly IAiChatService _aiChatService;

        public AiChatController(IAiChatService aiChatService)
        {
            _aiChatService = aiChatService;
        }

        /// <summary>
        /// Gửi tin nhắn đến AI và nhận phản hồi. Không cần đăng nhập.
        /// </summary>
        [HttpPost("send")]
        public async Task<ActionResult<AiChatResponse>> SendMessage([FromBody] AiChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest(new { Success = false, Reply = "Tin nhắn không được để trống." });
            }

            if (request.Message.Length > 500)
            {
                return BadRequest(new { Success = false, Reply = "Tin nhắn quá dài (tối đa 500 ký tự)." });
            }

            var result = await _aiChatService.SendMessageAsync(request);
            return Ok(result);
        }
    }
}
