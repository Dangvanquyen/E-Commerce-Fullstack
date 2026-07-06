using System;
using System.Collections.Generic;

namespace Application.DTOs.Responses
{
    public class ChatRoomResponse
    {
        public int ChatRoomId { get; set; }
        public int NguoiDungId { get; set; }
        public string RoomName { get; set; }
        public bool IsActive { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayCapNhat { get; set; }
        public string TenNguoiDung { get; set; }
        public int UnreadMessageCount { get; set; }
        public ChatMessageResponse LastMessage { get; set; }
        public List<ChatMessageResponse> Messages { get; set; } = new List<ChatMessageResponse>();
    }
}