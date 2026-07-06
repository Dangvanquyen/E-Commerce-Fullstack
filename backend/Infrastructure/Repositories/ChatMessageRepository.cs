using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ChatMessageRepository : GenericRepository<ChatMessage>, IChatMessageRepository
    {
        public ChatMessageRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ChatMessage>> GetMessagesByChatRoomIdAsync(int chatRoomId)
        {
            return await _context.ChatMessages
                .Include(m => m.NguoiDung)
                .Where(m => m.ChatRoomId == chatRoomId)
                .OrderBy(m => m.NgayGui)
                .ToListAsync();
        }

        public async Task<int> GetUnreadMessageCountAsync(int chatRoomId, bool isFromAdmin)
        {
            // Logic: 
            // - Nếu isFromAdmin = true (admin đang check), đếm tin nhắn từ user chưa đọc
            // - Nếu isFromAdmin = false (user đang check), đếm tin nhắn từ admin chưa đọc
            return await _context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId && 
                           m.IsFromAdmin == !isFromAdmin && // Đảo ngược logic
                           !m.DaDoc)
                .CountAsync();
        }

        public async Task MarkMessagesAsReadAsync(int chatRoomId, bool isFromAdmin)
        {
            // Logic tương tự: đánh dấu đã đọc tin nhắn từ phía đối diện
            var messages = await _context.ChatMessages
                .Where(m => m.ChatRoomId == chatRoomId && 
                           m.IsFromAdmin == !isFromAdmin && // Đảo ngược logic
                           !m.DaDoc)
                .ToListAsync();

            foreach (var message in messages)
            {
                message.DaDoc = true;
            }
            
            // CRITICAL FIX: Thêm SaveChanges
            await _context.SaveChangesAsync();
        }
    }
}