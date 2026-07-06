namespace Application.DTOs.Responses
{
    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public DateTime? Expiration { get; set; }
        public NguoiDungResponse? NguoiDung { get; set; }
        public int VaiTroId { get; set; }  // <--- Cần dòng này
    }
}
