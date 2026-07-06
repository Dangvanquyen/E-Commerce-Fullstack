using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using WebAPIs.Hubs;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IChatService chatService, IHubContext<ChatHub> hubContext)
        {
            _chatService = chatService;
            _hubContext = hubContext;
        }

        [HttpGet("room")]
        public async Task<ActionResult<ApiResponse<ChatRoomResponse>>> GetOrCreateChatRoom()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"ChatController - GetOrCreateChatRoom - UserIdClaim: {userIdClaim}");
            
            if (!int.TryParse(userIdClaim, out int userId))
            {
                Console.WriteLine($"ChatController - Invalid user ID: {userIdClaim}");
                return BadRequest(new ApiResponse<ChatRoomResponse>
                {
                    Success = false,
                    Message = "Invalid user ID"
                });
            }

            Console.WriteLine($"ChatController - Getting chat room for user: {userId}");
            var result = await _chatService.GetOrCreateChatRoomAsync(userId);
            Console.WriteLine($"ChatController - Result: {result.Success}, Message: {result.Message}");
            return Ok(result);
        }

        [HttpPost("send")]
        public async Task<ActionResult<ApiResponse<ChatMessageResponse>>> SendMessage([FromBody] SendMessageRequest request)
        {
            // VALIDATION FIX: Validate input
            if (request == null)
            {
                return BadRequest(new ApiResponse<ChatMessageResponse>
                {
                    Success = false,
                    Message = "Request is required"
                });
            }

            if (string.IsNullOrWhiteSpace(request.NoiDung))
            {
                return BadRequest(new ApiResponse<ChatMessageResponse>
                {
                    Success = false,
                    Message = "Message content is required"
                });
            }

            if (request.NoiDung.Length > 1000)
            {
                return BadRequest(new ApiResponse<ChatMessageResponse>
                {
                    Success = false,
                    Message = "Message too long (max 1000 characters)"
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            if (!int.TryParse(userIdClaim, out int userId))
            {
                return BadRequest(new ApiResponse<ChatMessageResponse>
                {
                    Success = false,
                    Message = "Invalid user ID"
                });
            }

            bool isFromAdmin = userRole == "Admin";
            var result = await _chatService.SendMessageAsync(userId, request, isFromAdmin);

            if (result.Success)
            {
                Console.WriteLine($"ChatController - Message sent successfully, ChatRoomId: {result.Data.ChatRoomId}");
                
                // ROUTING FIX: Improved message routing logic
                if (!isFromAdmin)
                {
                    // User gửi tin nhắn: thông báo cho tất cả admin
                    Console.WriteLine($"ChatController - User sent message, notifying all admins");
                    await _hubContext.Clients.Group("Admins")
                        .SendAsync("ReceiveMessage", result.Data);
                }
                else if (request.ChatRoomId.HasValue)
                {
                    // Admin gửi tin nhắn: thông báo cho user cụ thể và các admin khác
                    Console.WriteLine($"ChatController - Admin sent message, notifying user and other admins");
                    
                    var chatRoom = await _chatService.GetChatRoomWithMessagesAsync(request.ChatRoomId.Value);
                    if (chatRoom.Success)
                    {
                        var targetUserId = chatRoom.Data.NguoiDungId.ToString();
                        
                        // Gửi cho user cụ thể
                        var userConnectionId = ChatHub.GetUserConnectionId(targetUserId);
                        Console.WriteLine($"ChatController - Target user ID: {targetUserId}, Connection ID: {userConnectionId}");
                        
                        if (!string.IsNullOrEmpty(userConnectionId))
                        {
                            Console.WriteLine($"ChatController - Sending message to user connection: {userConnectionId}");
                            await _hubContext.Clients.Client(userConnectionId)
                                .SendAsync("ReceiveMessage", result.Data);
                        }
                        else
                        {
                            Console.WriteLine($"ChatController - User {targetUserId} is not connected");
                        }
                        
                        // Gửi cho các admin khác trong group
                        await _hubContext.Clients.Group("Admins")
                            .SendAsync("ReceiveMessage", result.Data);
                    }
                }
            }

            return Ok(result);
        }

        [HttpGet("rooms")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<List<ChatRoomResponse>>>> GetActiveChatRooms()
        {
            var result = await _chatService.GetActiveChatRoomsAsync();
            return Ok(result);
        }

        [HttpGet("room/{chatRoomId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ChatRoomResponse>>> GetChatRoomWithMessages(int chatRoomId)
        {
            var result = await _chatService.GetChatRoomWithMessagesAsync(chatRoomId);
            return Ok(result);
        }

        [HttpPost("room/{chatRoomId}/mark-read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkMessagesAsRead(int chatRoomId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isFromAdmin = userRole == "Admin";

            var result = await _chatService.MarkMessagesAsReadAsync(chatRoomId, isFromAdmin);
            return Ok(result);
        }

        [HttpGet("room/{chatRoomId}/unread-count")]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadMessageCount(int chatRoomId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            bool isFromAdmin = userRole == "Admin";

            var result = await _chatService.GetUnreadMessageCountAsync(chatRoomId, isFromAdmin);
            return Ok(result);
        }

        [HttpGet("online-users")]
        [Authorize(Roles = "Admin")]
        public ActionResult<List<string>> GetOnlineUsers()
        {
            return Ok(ChatHub.GetOnlineUserIds());
        }

        [HttpGet("debug/users")]
        public async Task<ActionResult> GetUsersDebug()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            
            return Ok(new {
                UserId = userIdClaim,
                Role = userRole,
                Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            });
        }
    }
}