using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SanPhamChiTietService : ISanPhamChiTietService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SanPhamChiTietService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<SanPhamChiTiet>> GetAllAsync()
        {
            return await _unitOfWork.SanPhamChiTiet.GetAllAsync();
        }

        public async Task<(IEnumerable<SanPhamChiTiet> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _unitOfWork.SanPhamChiTiet.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<(IEnumerable<SanPhamChiTiet> Items, int TotalCount)> GetPagedInventoryAsync(
            string? searchTerm, int? danhMucId, string? stockStatus, int pageNumber, int pageSize)
        {
            return await _unitOfWork.SanPhamChiTiet.GetPagedInventoryAsync(searchTerm, danhMucId, stockStatus, pageNumber, pageSize);
        }

        public async Task<InventoryStatsResponse> GetInventoryStatsAsync()
        {
            var allVariants = await _unitOfWork.SanPhamChiTiet.GetAllAsync();
            var totalVariants = allVariants.Count();
            var totalProductsCount = allVariants.Sum(v => v.SoLuongTon);
            var lowStockCount = allVariants.Count(v => v.SoLuongTon > 0 && v.SoLuongTon <= 10);
            var outOfStockCount = allVariants.Count(v => v.SoLuongTon == 0);

            return new InventoryStatsResponse
            {
                TotalVariants = totalVariants,
                TotalProductsCount = totalProductsCount,
                LowStockCount = lowStockCount,
                OutOfStockCount = outOfStockCount
            };
        }

        public async Task<SanPhamChiTiet?> GetByIdAsync(int id)
        {
            return await _unitOfWork.SanPhamChiTiet.GetByIdAsync(id);
        }

        public async Task<SanPhamChiTiet?> GetChiTietWithSanPhamAsync(int sanPhamChiTietId)
        {
            return await _unitOfWork.SanPhamChiTiet.GetChiTietWithSanPhamAsync(sanPhamChiTietId);
        }

        public async Task<IEnumerable<SanPhamChiTiet>> GetChiTietsBySanPhamAsync(int sanPhamId)
        {
            return await _unitOfWork.SanPhamChiTiet.GetChiTietsBySanPhamAsync(sanPhamId);
        }

        public async Task<SanPhamChiTiet?> GetBySizeAndMauSacAsync(int sanPhamId, string size, string mauSac)
        {
            return await _unitOfWork.SanPhamChiTiet.GetBySizeAndMauSacAsync(sanPhamId, size, mauSac);
        }

        public async Task<IEnumerable<SanPhamChiTiet>> GetAvailableChiTietsAsync(int sanPhamId)
        {
            return await _unitOfWork.SanPhamChiTiet.GetAvailableChiTietsAsync(sanPhamId);
        }

        public async Task<SanPhamChiTiet> CreateAsync(SanPhamChiTiet sanPhamChiTiet)
        {
            await _unitOfWork.SanPhamChiTiet.AddAsync(sanPhamChiTiet);
            await _unitOfWork.SaveChangesAsync();
            return sanPhamChiTiet;
        }

        public async Task<SanPhamChiTiet?> UpdateAsync(int id, SanPhamChiTiet sanPhamChiTiet)
        {
            var existingChiTiet = await _unitOfWork.SanPhamChiTiet.GetByIdAsync(id);
            if (existingChiTiet == null)
                return null;

            existingChiTiet.Size = sanPhamChiTiet.Size;
            existingChiTiet.MauSac = sanPhamChiTiet.MauSac;
            existingChiTiet.SoLuongTon = sanPhamChiTiet.SoLuongTon;

            // Áp dụng tính trung bình cộng nếu giá mới thay đổi so với giá cũ
            if (existingChiTiet.GiaBan > 0 && sanPhamChiTiet.GiaBan != existingChiTiet.GiaBan)
            {
                existingChiTiet.GiaBan = (existingChiTiet.GiaBan + sanPhamChiTiet.GiaBan) / 2;
            }
            else
            {
                existingChiTiet.GiaBan = sanPhamChiTiet.GiaBan;
            }

            existingChiTiet.HinhAnh = sanPhamChiTiet.HinhAnh;

            _unitOfWork.SanPhamChiTiet.Update(existingChiTiet);
            await _unitOfWork.SaveChangesAsync();
            return existingChiTiet;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var chiTiet = await _unitOfWork.SanPhamChiTiet.GetByIdAsync(id);
            if (chiTiet == null)
                return false;

            _unitOfWork.SanPhamChiTiet.Remove(chiTiet);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSoLuongTonAsync(int sanPhamChiTietId, int soLuong)
        {
            var result = await _unitOfWork.SanPhamChiTiet.UpdateSoLuongTonAsync(sanPhamChiTietId, soLuong);
            if (result)
            {
                await _unitOfWork.SaveChangesAsync();
            }
            return result;
        }
    }
}
