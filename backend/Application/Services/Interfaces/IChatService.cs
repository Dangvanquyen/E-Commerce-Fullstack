using Application.DTOs.Requests;
using Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IChatService
    {
        Task<ApiResponse<ChatRoomResponse>> GetOrCreateChatRoomAsync(int nguoiDungId);
        Task<ApiResponse<ChatMessageResponse>> SendMessageAsync(int nguoiDungId, SendMessageRequest request, bool isFromAdmin = false);
        Task<ApiResponse<List<ChatRoomResponse>>> GetActiveChatRoomsAsync();
        Task<ApiResponse<ChatRoomResponse>> GetChatRoomWithMessagesAsync(int chatRoomId);
        Task<ApiResponse<bool>> MarkMessagesAsReadAsync(int chatRoomId, bool isFromAdmin);
        Task<ApiResponse<int>> GetUnreadMessageCountAsync(int chatRoomId, bool isFromAdmin);
    }
}