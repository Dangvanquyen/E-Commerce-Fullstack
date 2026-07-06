using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class ChatRoom
    {
        public int ChatRoomId { get; set; }
        public int NguoiDungId { get; set; }
        public string RoomName { get; set; }
        public bool IsActive { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }

        public NguoiDung NguoiDung { get; set; }
        public ICollection<ChatMessage> ChatMessages { get; set; }
    }
}