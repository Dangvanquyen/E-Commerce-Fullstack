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
    public class DonHangChiTietService : IDonHangChiTietService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DonHangChiTietService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<DonHangChiTiet?> GetByIdAsync(int id)
        {
            return await _unitOfWork.DonHangChiTiet.GetByIdAsync(id);
        }

        public async Task<IEnumerable<DonHangChiTiet>> GetChiTietsByDonHangAsync(int donHangId)
        {
            return await _unitOfWork.DonHangChiTiet.GetChiTietsByDonHangAsync(donHangId);
        }

        public async Task<DonHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int donHangChiTietId)
        {
            return await _unitOfWork.DonHangChiTiet.GetChiTietWithSanPhamInfoAsync(donHangChiTietId);
        }

        public async Task<decimal> GetTongTienByDonHangAsync(int donHangId)
        {
            return await _unitOfWork.DonHangChiTiet.GetTongTienByDonHangAsync(donHangId);
        }

        public async Task<DonHangChiTiet> CreateAsync(DonHangChiTiet donHangChiTiet)
        {
            await _unitOfWork.DonHangChiTiet.AddAsync(donHangChiTiet);
            await _unitOfWork.SaveChangesAsync();
            return donHangChiTiet;
        }

        public async Task<DonHangChiTiet?> UpdateAsync(int id, DonHangChiTiet donHangChiTiet)
        {
            var existingChiTiet = await _unitOfWork.DonHangChiTiet.GetByIdAsync(id);
            if (existingChiTiet == null)
                return null;

            existingChiTiet.SoLuong = donHangChiTiet.SoLuong;
            existingChiTiet.DonGia = donHangChiTiet.DonGia;

            _unitOfWork.DonHangChiTiet.Update(existingChiTiet);
            await _unitOfWork.SaveChangesAsync();
            return existingChiTiet;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var chiTiet = await _unitOfWork.DonHangChiTiet.GetByIdAsync(id);
            if (chiTiet == null)
                return false;

            _unitOfWork.DonHangChiTiet.Remove(chiTiet);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
