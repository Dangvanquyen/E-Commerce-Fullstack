namespace Application.DTOs.Responses
{
    public class ValidateVoucherResponse
    {
        public string Code { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public decimal DiscountAmount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
