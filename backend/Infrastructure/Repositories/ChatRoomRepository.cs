using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ChatRoomRepository : GenericRepository<ChatRoom>, IChatRoomRepository
    {
        public ChatRoomRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<ChatRoom> GetByNguoiDungIdAsync(int nguoiDungId)
        {
            return await _context.ChatRooms
                .Include(cr => cr.NguoiDung)
                .Include(cr => cr.ChatMessages.OrderBy(m => m.NgayGui))
                .ThenInclude(m => m.NguoiDung)
                .FirstOrDefaultAsync(cr => cr.NguoiDungId == nguoiDungId);
        }

        public async Task<IEnumerable<ChatRoom>> GetActiveChatRoomsAsync()
        {
            return await _context.ChatRooms
                .Include(cr => cr.NguoiDung)
                .Include(cr => cr.ChatMessages.OrderByDescending(m => m.NgayGui).Take(1))
                .Where(cr => cr.IsActive)
                .OrderByDescending(cr => cr.NgayCapNhat ?? cr.NgayTao)
                .ToListAsync();
        }

        public async Task<ChatRoom> GetChatRoomWithMessagesAsync(int chatRoomId)
        {
            return await _context.ChatRooms
                .Include(cr => cr.NguoiDung)
                .Include(cr => cr.ChatMessages.OrderBy(m => m.NgayGui))
                .ThenInclude(m => m.NguoiDung)
                .FirstOrDefaultAsync(cr => cr.ChatRoomId == chatRoomId);
        }
    }
}