using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ThanhToanService : IThanhToanService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ThanhToanService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ThanhToan?> GetByIdAsync(int id)
        {
            return await _unitOfWork.ThanhToan.GetByIdAsync(id);
        }

        public async Task<ThanhToan?> GetThanhToanByDonHangAsync(int donHangId)
        {
            return await _unitOfWork.ThanhToan.GetThanhToanByDonHangAsync(donHangId);
        }

        public async Task<IEnumerable<ThanhToan>> GetThanhToansByTrangThaiAsync(string trangThai)
        {
            return await _unitOfWork.ThanhToan.GetThanhToansByTrangThaiAsync(trangThai);
        }

        public async Task<IEnumerable<ThanhToan>> GetThanhToansByPhuongThucAsync(string phuongThuc)
        {
            return await _unitOfWork.ThanhToan.GetThanhToansByPhuongThucAsync(phuongThuc);
        }

        public async Task<ThanhToan> CreateAsync(ThanhToan thanhToan)
        {
            thanhToan.TrangThai = "ChuaThanhToan";
            await _unitOfWork.ThanhToan.AddAsync(thanhToan);
            await _unitOfWork.SaveChangesAsync();
            return thanhToan;
        }

        public async Task<ThanhToan> CreateForDonHangAsync(int donHangId, string phuongThuc)
        {
            // Kiểm tra đơn hàng tồn tại
            var donHang = await _unitOfWork.DonHang.GetByIdAsync(donHangId);
            if (donHang == null)
            {
                throw new InvalidOperationException("Đơn hàng không tồn tại");
            }

            // Kiểm tra đã có thanh toán chưa
            var existingThanhToan = await _unitOfWork.ThanhToan.GetThanhToanByDonHangAsync(donHangId);
            if (existingThanhToan != null)
            {
                throw new InvalidOperationException("Đơn hàng đã có thông tin thanh toán");
            }

            var thanhToan = new ThanhToan
            {
                DonHangId = donHangId,
                PhuongThuc = phuongThuc,
                TrangThai = "ChuaThanhToan",
                NgayThanhToan = null
            };

            await _unitOfWork.ThanhToan.AddAsync(thanhToan);
            await _unitOfWork.SaveChangesAsync();
            return thanhToan;
        }

        public async Task<ThanhToan?> UpdateAsync(int id, ThanhToan thanhToan)
        {
            var existingThanhToan = await _unitOfWork.ThanhToan.GetByIdAsync(id);
            if (existingThanhToan == null)
                return null;

            existingThanhToan.PhuongThuc = thanhToan.PhuongThuc;
            existingThanhToan.TrangThai = thanhToan.TrangThai;
            existingThanhToan.NgayThanhToan = thanhToan.NgayThanhToan;

            _unitOfWork.ThanhToan.Update(existingThanhToan);
            await _unitOfWork.SaveChangesAsync();
            return existingThanhToan;
        }

        public async Task<bool> UpdateTrangThaiAsync(int thanhToanId, string trangThai)
        {
            var result = await _unitOfWork.ThanhToan.UpdateTrangThaiAsync(thanhToanId, trangThai);
            if (result)
            {
                await _unitOfWork.SaveChangesAsync();
            }
            return result;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var thanhToan = await _unitOfWork.ThanhToan.GetByIdAsync(id);
            if (thanhToan == null)
                return false;

            _unitOfWork.ThanhToan.Remove(thanhToan);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
