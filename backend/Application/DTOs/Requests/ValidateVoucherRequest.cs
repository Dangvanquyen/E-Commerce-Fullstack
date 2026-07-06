using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Requests
{
    public class ValidateVoucherRequest
    {
        [Required(ErrorMessage = "Mã giảm giá là bắt buộc")]
        public string Code { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tổng tiền đơn hàng là bắt buộc")]
        [Range(0, double.MaxValue, ErrorMessage = "Tổng tiền đơn hàng phải lớn hơn hoặc bằng 0")]
        public decimal OrderAmount { get; set; }
    }
}
