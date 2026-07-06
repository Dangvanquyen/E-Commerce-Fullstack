namespace Application.DTOs.Requests
{
    public class CreateDonHangDirectRequest
    {
        public string DiaChiGiaoHang { get; set; } = string.Empty;
        public string PhuongThucThanhToan { get; set; } = string.Empty;
        public string? VoucherCode { get; set; }
        public List<OrderItemRequest> OrderItems { get; set; } = new List<OrderItemRequest>();
    }

    public class OrderItemRequest
    {
        public int SanPhamChiTietId { get; set; }
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }
    }
}
