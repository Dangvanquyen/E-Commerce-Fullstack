using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IChatRoomRepository : IGenericRepository<ChatRoom>
    {
        Task<ChatRoom> GetByNguoiDungIdAsync(int nguoiDungId);
        Task<IEnumerable<ChatRoom>> GetActiveChatRoomsAsync();
        Task<ChatRoom> GetChatRoomWithMessagesAsync(int chatRoomId);
    }
}