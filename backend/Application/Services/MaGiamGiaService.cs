using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class MaGiamGiaService : IMaGiamGiaService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MaGiamGiaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<MaGiamGia>> GetAllAsync()
        {
            return await _unitOfWork.MaGiamGia.GetAllAsync();
        }

        public async Task<IEnumerable<MaGiamGia>> GetActiveVouchersAsync()
        {
            var now = DateTime.Now;
            var all = await _unitOfWork.MaGiamGia.GetAllAsync();
            return all.Where(m => m.TrangThai 
                               && m.NgayBatDau <= now 
                               && m.NgayKetThuc >= now 
                               && m.SoLuongDaDung < m.SoLuong)
                      .OrderByDescending(m => m.MaGiamGiaId);
        }

        public async Task<(IEnumerable<MaGiamGia> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _unitOfWork.MaGiamGia.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<MaGiamGia?> GetByIdAsync(int id)
        {
            return await _unitOfWork.MaGiamGia.GetByIdAsync(id);
        }

        public async Task<MaGiamGia?> GetByCodeAsync(string code)
        {
            return await _unitOfWork.MaGiamGia.GetByCodeAsync(code);
        }

        public async Task<MaGiamGia> CreateAsync(MaGiamGia maGiamGia)
        {
            maGiamGia.SoLuongDaDung = 0;
            await _unitOfWork.MaGiamGia.AddAsync(maGiamGia);
            await _unitOfWork.SaveChangesAsync();
            return maGiamGia;
        }

        public async Task<MaGiamGia?> UpdateAsync(int id, MaGiamGia maGiamGia)
        {
            var existing = await _unitOfWork.MaGiamGia.GetByIdAsync(id);
            if (existing == null)
                return null;

            existing.Code = maGiamGia.Code;
            existing.MoTa = maGiamGia.MoTa;
            existing.LoaiGiamGia = maGiamGia.LoaiGiamGia;
            existing.GiaTri = maGiamGia.GiaTri;
            existing.GiaTriGiamToiDa = maGiamGia.GiaTriGiamToiDa;
            existing.DonHangToiThieu = maGiamGia.DonHangToiThieu;
            existing.NgayBatDau = maGiamGia.NgayBatDau;
            existing.NgayKetThuc = maGiamGia.NgayKetThuc;
            existing.SoLuong = maGiamGia.SoLuong;
            existing.TrangThai = maGiamGia.TrangThai;

            _unitOfWork.MaGiamGia.Update(existing);
            await _unitOfWork.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _unitOfWork.MaGiamGia.GetByIdAsync(id);
            if (existing == null)
                return false;

            _unitOfWork.MaGiamGia.Remove(existing);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTrangThaiAsync(int id, bool trangThai)
        {
            var existing = await _unitOfWork.MaGiamGia.GetByIdAsync(id);
            if (existing == null)
                return false;

            existing.TrangThai = trangThai;
            _unitOfWork.MaGiamGia.Update(existing);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<(bool IsValid, decimal DiscountAmount, string Message)> ValidateVoucherAsync(string code, decimal orderAmount)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return (false, 0, "Mã giảm giá trống");
            }

            var voucher = await _unitOfWork.MaGiamGia.GetByCodeAsync(code.Trim().ToUpper());
            if (voucher == null)
            {
                return (false, 0, "Mã giảm giá không tồn tại");
            }

            if (!voucher.TrangThai)
            {
                return (false, 0, "Mã giảm giá đã bị vô hiệu hóa");
            }

            var now = DateTime.Now;
            if (voucher.NgayBatDau > now)
            {
                return (false, 0, "Mã giảm giá chưa đến thời gian áp dụng");
            }

            if (voucher.NgayKetThuc < now)
            {
                return (false, 0, "Mã giảm giá đã hết hạn sử dụng");
            }

            if (voucher.SoLuongDaDung >= voucher.SoLuong)
            {
                return (false, 0, "Mã giảm giá đã hết lượt sử dụng");
            }

            if (orderAmount < voucher.DonHangToiThieu)
            {
                return (false, 0, $"Mã giảm giá chỉ áp dụng cho đơn hàng từ {voucher.DonHangToiThieu:N0}đ trở lên");
            }

            decimal discount = 0;
            if (voucher.LoaiGiamGia.Equals("PhanTram", StringComparison.OrdinalIgnoreCase))
            {
                discount = orderAmount * (voucher.GiaTri / 100m);
                if (voucher.GiaTriGiamToiDa.HasValue && voucher.GiaTriGiamToiDa.Value > 0)
                {
                    discount = Math.Min(discount, voucher.GiaTriGiamToiDa.Value);
                }
            }
            else // "SoTien"
            {
                discount = Math.Min(voucher.GiaTri, orderAmount);
            }

            // Làm tròn tiền giảm
            discount = Math.Round(discount, 2);

            return (true, discount, "Áp dụng mã giảm giá thành công");
        }
    }
}
