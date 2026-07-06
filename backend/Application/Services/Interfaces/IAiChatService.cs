namespace Application.Services.Interfaces
{
    public class AiChatMessage
    {
        public string Role { get; set; } = string.Empty; // "user" hoặc "model"
        public string Content { get; set; } = string.Empty;
    }

    public class AiChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public List<AiChatMessage> History { get; set; } = new();
    }

    public class AiChatResponse
    {
        public bool Success { get; set; }
        public string Reply { get; set; } = string.Empty;
        public string? Error { get; set; }
    }

    public interface IAiChatService
    {
        Task<AiChatResponse> SendMessageAsync(AiChatRequest request);
        Task<string> BuildStoreContextAsync();
    }
}
