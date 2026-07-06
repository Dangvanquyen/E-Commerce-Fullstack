using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Requests
{
    public class SendMessageRequest
    {
        [Required]
        [MaxLength(1000)]
        public string NoiDung { get; set; }
        
        public int? ChatRoomId { get; set; }
    }
}