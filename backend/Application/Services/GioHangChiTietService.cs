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
    public class GioHangChiTietService : IGioHangChiTietService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GioHangChiTietService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<GioHangChiTiet?> GetByIdAsync(int id)
        {
            return await _unitOfWork.GioHangChiTiet.GetByIdAsync(id);
        }

        public async Task<GioHangChiTiet?> GetChiTietByGioHangAndSanPhamAsync(int gioHangId, int sanPhamChiTietId)
        {
            return await _unitOfWork.GioHangChiTiet.GetChiTietByGioHangAndSanPhamAsync(gioHangId, sanPhamChiTietId);
        }

        public async Task<IEnumerable<GioHangChiTiet>> GetChiTietsByGioHangAsync(int gioHangId)
        {
            return await _unitOfWork.GioHangChiTiet.GetChiTietsByGioHangAsync(gioHangId);
        }

        public async Task<GioHangChiTiet?> GetChiTietWithSanPhamInfoAsync(int gioHangChiTietId)
        {
            return await _unitOfWork.GioHangChiTiet.GetChiTietWithSanPhamInfoAsync(gioHangChiTietId);
        }

        public async Task<GioHangChiTiet> AddToCartAsync(int gioHangId, int sanPhamChiTietId, int soLuong)
        {
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            var existingChiTiet = await _unitOfWork.GioHangChiTiet
                .GetChiTietByGioHangAndSanPhamAsync(gioHangId, sanPhamChiTietId);

            if (existingChiTiet != null)
            {
                // Nếu đã có, cập nhật số lượng
                existingChiTiet.SoLuong += soLuong;
                _unitOfWork.GioHangChiTiet.Update(existingChiTiet);
                await _unitOfWork.SaveChangesAsync();
                return existingChiTiet;
            }

            // Nếu chưa có, thêm mới
            var chiTiet = new GioHangChiTiet
            {
                GioHangId = gioHangId,
                SanPhamChiTietId = sanPhamChiTietId,
                SoLuong = soLuong
            };

            await _unitOfWork.GioHangChiTiet.AddAsync(chiTiet);
            await _unitOfWork.SaveChangesAsync();
            return chiTiet;
        }

        public async Task<GioHangChiTiet?> UpdateSoLuongAsync(int gioHangChiTietId, int soLuong)
        {
            var chiTiet = await _unitOfWork.GioHangChiTiet.GetByIdAsync(gioHangChiTietId);
            if (chiTiet == null)
                return null;

            if (soLuong <= 0)
            {
                _unitOfWork.GioHangChiTiet.Remove(chiTiet);
                await _unitOfWork.SaveChangesAsync();
                return null;
            }

            chiTiet.SoLuong = soLuong;
            _unitOfWork.GioHangChiTiet.Update(chiTiet);
            await _unitOfWork.SaveChangesAsync();
            return chiTiet;
        }

        public async Task<bool> RemoveFromCartAsync(int gioHangChiTietId)
        {
            var chiTiet = await _unitOfWork.GioHangChiTiet.GetByIdAsync(gioHangChiTietId);
            if (chiTiet == null)
                return false;

            _unitOfWork.GioHangChiTiet.Remove(chiTiet);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveAllByGioHangAsync(int gioHangId)
        {
            await _unitOfWork.GioHangChiTiet.RemoveAllByGioHangAsync(gioHangId);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
