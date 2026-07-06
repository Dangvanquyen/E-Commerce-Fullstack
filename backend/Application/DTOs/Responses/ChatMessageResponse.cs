using System;

namespace Application.DTOs.Responses
{
    public class ChatMessageResponse
    {
        public int ChatMessageId { get; set; }
        public int ChatRoomId { get; set; }
        public int NguoiDungId { get; set; }
        public string NoiDung { get; set; }
        public bool IsFromAdmin { get; set; }
        public bool DaDoc { get; set; }
        public DateTime NgayGui { get; set; }
        public string TenNguoiDung { get; set; }
    }
}