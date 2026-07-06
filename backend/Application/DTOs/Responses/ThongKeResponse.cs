namespace Application.DTOs.Responses
{
    public class DoanhThuKyResponse
    {
        public string Ky { get; set; } = string.Empty;
        public int SoDonHang { get; set; }
        public decimal DoanhThu { get; set; }
    }

    public class DoanhThuSanPhamResponse
    {
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public int DanhMucId { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public int SoLuongBan { get; set; }
        public decimal DoanhThu { get; set; }
    }

    public class DoanhThuDanhMucResponse
    {
        public int DanhMucId { get; set; }
        public string TenDanhMuc { get; set; } = string.Empty;
        public int SoLuongBan { get; set; }
        public decimal DoanhThu { get; set; }
    }

    public class ThongKeTongQuanResponse
    {
        public decimal TongDoanhThu { get; set; }
        public int TongDonHang { get; set; }
        public int DonHangHoanThanh { get; set; }
        public int DonHangChoXuLy { get; set; }
        public int GioHangChuaMua { get; set; }
        public decimal GiaTriGioHangChuaMua { get; set; }
    }

    public class GioHangAdminResponse
    {
        public int GioHangId { get; set; }
        public int NguoiDungId { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime NgayTao { get; set; }
        public decimal TongGiaTri { get; set; }
        public int TongSoSanPham { get; set; }
        public List<GioHangChiTietAdminResponse> ChiTiets { get; set; } = new();
    }

    public class GioHangChiTietAdminResponse
    {
        public int GioHangChiTietId { get; set; }
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string TenDanhMuc { get; set; } = string.Empty;
        public string Size { get; set; } = string.Empty;
        public string MauSac { get; set; } = string.Empty;
        public int SoLuong { get; set; }
        public decimal DonGia { get; set; }
        public decimal ThanhTien { get; set; }
    }

    public class SanPhamGioHangChuaMuaResponse
    {
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string TenDanhMuc { get; set; } = string.Empty;
        public int SoLuongTrongGio { get; set; }
        public int SoGioHang { get; set; }
        public decimal TongGiaTri { get; set; }
    }

    /// <summary>Thống kê click / xem sản phẩm</summary>
    public class ThongKeClickSanPhamResponse
    {
        public int SanPhamId { get; set; }
        public string TenSanPham { get; set; } = string.Empty;
        public string TenDanhMuc { get; set; } = string.Empty;
        public string? HinhAnh { get; set; }

        /// <summary>Tổng số lượt click/xem</summary>
        public int SoLuotClick { get; set; }

        /// <summary>Số phiên xem duy nhất (unique sessions)</summary>
        public int SoPhienXemDuyNhat { get; set; }

        /// <summary>Thời gian xem trung bình tính bằng giây</summary>
        public double ThoiGianXemTBGiay { get; set; }

        /// <summary>Thời gian xem trung bình (phút, làm tròn 1 số lẻ)</summary>
        public double ThoiGianXemTBPhut => Math.Round(ThoiGianXemTBGiay / 60.0, 1);

        /// <summary>Số lượng đã bán (từ đơn hoàn thành)</summary>
        public int SoLuongDaBan { get; set; }

        /// <summary>Tỉ lệ chuyển đổi click → mua (%)</summary>
        public double TiLeChuyen => SoLuotClick > 0
            ? Math.Round((double)SoLuongDaBan / SoLuotClick * 100, 1)
            : 0;

        /// <summary>Lần click gần nhất</summary>
        public DateTime? LanClickGanNhat { get; set; }
    }

    /// <summary>Kết quả ghi nhận click</summary>
    public class GhiNhanClickResponse
    {
        public long LichSuId { get; set; }
    }
}
