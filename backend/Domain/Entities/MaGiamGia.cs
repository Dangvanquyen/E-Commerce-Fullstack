using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    public class MaGiamGia
    {
        public int MaGiamGiaId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string MoTa { get; set; } = string.Empty;
        
        // "PhanTram" (e.g. 10%) or "SoTien" (e.g. 50000 VND)
        public string LoaiGiamGia { get; set; } = "PhanTram";
        public decimal GiaTri { get; set; }
        public decimal? GiaTriGiamToiDa { get; set; }
        public decimal DonHangToiThieu { get; set; }
        
        public DateTime NgayBatDau { get; set; }
        public DateTime NgayKetThuc { get; set; }
        
        public int SoLuong { get; set; }
        public int SoLuongDaDung { get; set; }
        public bool TrangThai { get; set; }

        public ICollection<DonHang> DonHangs { get; set; } = new List<DonHang>();
    }
}
