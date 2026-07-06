using System;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Requests
{
    public class CreateMaGiamGiaRequest
    {
        [Required(ErrorMessage = "Mã giảm giá là bắt buộc")]
        [MaxLength(50, ErrorMessage = "Mã giảm giá không vượt quá 50 ký tự")]
        public string Code { get; set; } = string.Empty;

        [MaxLength(250, ErrorMessage = "Mô tả không vượt quá 250 ký tự")]
        public string MoTa { get; set; } = string.Empty;

        [Required(ErrorMessage = "Loại giảm giá là bắt buộc")]
        public string LoaiGiamGia { get; set; } = "PhanTram"; // "PhanTram" or "SoTien"

        [Required(ErrorMessage = "Giá trị giảm là bắt buộc")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá trị giảm phải lớn hơn 0")]
        public decimal GiaTri { get; set; }

        public decimal? GiaTriGiamToiDa { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0")]
        public decimal DonHangToiThieu { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateTime NgayBatDau { get; set; }

        [Required(ErrorMessage = "Ngày kết thúc là bắt buộc")]
        public DateTime NgayKetThuc { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn hoặc bằng 1")]
        public int SoLuong { get; set; }

        public bool TrangThai { get; set; } = true;
    }
}
