using System;

namespace Domain.Entities
{
    public class ChatMessage
    {
        public int ChatMessageId { get; set; }
        public int ChatRoomId { get; set; }
        public int NguoiDungId { get; set; }
        public string NoiDung { get; set; }
        public bool IsFromAdmin { get; set; }
        public bool DaDoc { get; set; }
        public DateTime NgayGui { get; set; }

        public ChatRoom ChatRoom { get; set; }
        public NguoiDung NguoiDung { get; set; }
    }
}