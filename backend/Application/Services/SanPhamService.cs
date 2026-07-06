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
    public class SanPhamService : ISanPhamService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SanPhamService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<SanPham>> GetAllAsync()
        {
            return await _unitOfWork.SanPham.GetAllAsync();
        }

        public async Task<IEnumerable<SanPham>> GetActiveSanPhamsAsync()
        {
            return await _unitOfWork.SanPham.GetActiveSanPhamsAsync();
        }

        public async Task<(IEnumerable<SanPham> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _unitOfWork.SanPham.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<SanPham?> GetByIdAsync(int id)
        {
            return await _unitOfWork.SanPham.GetByIdAsync(id);
        }

        public async Task<SanPham?> GetSanPhamWithChiTietAsync(int sanPhamId)
        {
            return await _unitOfWork.SanPham.GetSanPhamWithChiTietAsync(sanPhamId);
        }

        public async Task<SanPham?> GetSanPhamWithDanhMucAsync(int sanPhamId)
        {
            return await _unitOfWork.SanPham.GetSanPhamWithDanhMucAsync(sanPhamId);
        }

        public async Task<SanPham?> GetSanPhamWithFullDetailsAsync(int sanPhamId)
        {
            return await _unitOfWork.SanPham.GetSanPhamWithFullDetailsAsync(sanPhamId);
        }

        public async Task<IEnumerable<SanPham>> GetSanPhamsByDanhMucAsync(int danhMucId)
        {
            return await _unitOfWork.SanPham.GetSanPhamsByDanhMucAsync(danhMucId);
        }

        public async Task<(IEnumerable<SanPham> Items, int TotalCount)> GetSanPhamsPagedByDanhMucAsync(
            int danhMucId, int pageNumber, int pageSize)
        {
            return await _unitOfWork.SanPham.GetSanPhamsPagedByDanhMucAsync(danhMucId, pageNumber, pageSize);
        }

        public async Task<IEnumerable<SanPham>> SearchSanPhamsAsync(string keyword)
        {
            return await _unitOfWork.SanPham.SearchSanPhamsAsync(keyword);
        }

        public async Task<SanPham> CreateAsync(SanPham sanPham)
        {
            sanPham.NgayTao = DateTime.Now;
            sanPham.TrangThai = true;

            await _unitOfWork.SanPham.AddAsync(sanPham);
            await _unitOfWork.SaveChangesAsync();
            return sanPham;
        }

        public async Task<SanPham?> UpdateAsync(int id, SanPham sanPham)
        {
            var existingSanPham = await _unitOfWork.SanPham.GetByIdAsync(id);
            if (existingSanPham == null)
                return null;

            existingSanPham.TenSanPham = sanPham.TenSanPham;
            existingSanPham.MoTa = sanPham.MoTa;

            // Áp dụng tính trung bình cộng nếu giá mới thay đổi so với giá cũ
            if (existingSanPham.Gia > 0 && sanPham.Gia != existingSanPham.Gia)
            {
                existingSanPham.Gia = (existingSanPham.Gia + sanPham.Gia) / 2;
            }
            else
            {
                existingSanPham.Gia = sanPham.Gia;
            }

            existingSanPham.HinhAnh = sanPham.HinhAnh;
            existingSanPham.DanhMucId = sanPham.DanhMucId;
            existingSanPham.TrangThai = sanPham.TrangThai;

            _unitOfWork.SanPham.Update(existingSanPham);
            await _unitOfWork.SaveChangesAsync();
            return existingSanPham;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sanPham = await _unitOfWork.SanPham.GetByIdAsync(id);
            if (sanPham == null)
                return false;

            _unitOfWork.SanPham.Remove(sanPham);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTrangThaiAsync(int id, bool trangThai)
        {
            var sanPham = await _unitOfWork.SanPham.GetByIdAsync(id);
            if (sanPham == null)
                return false;

            sanPham.TrangThai = trangThai;
            _unitOfWork.SanPham.Update(sanPham);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
