using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IChatMessageRepository : IGenericRepository<ChatMessage>
    {
        Task<IEnumerable<ChatMessage>> GetMessagesByChatRoomIdAsync(int chatRoomId);
        Task<int> GetUnreadMessageCountAsync(int chatRoomId, bool isFromAdmin);
        Task MarkMessagesAsReadAsync(int chatRoomId, bool isFromAdmin);
    }
}