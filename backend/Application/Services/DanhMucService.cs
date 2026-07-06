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
    public class DanhMucService : IDanhMucService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DanhMucService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<DanhMuc>> GetAllAsync()
        {
            return await _unitOfWork.DanhMuc.GetAllAsync();
        }

        public async Task<IEnumerable<DanhMuc>> GetActiveDanhMucsAsync()
        {
            return await _unitOfWork.DanhMuc.GetActiveDanhMucsAsync();
        }

        public async Task<(IEnumerable<DanhMuc> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _unitOfWork.DanhMuc.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<DanhMuc?> GetByIdAsync(int id)
        {
            return await _unitOfWork.DanhMuc.GetByIdAsync(id);
        }

        public async Task<DanhMuc?> GetByTenDanhMucAsync(string tenDanhMuc)
        {
            return await _unitOfWork.DanhMuc.GetByTenDanhMucAsync(tenDanhMuc);
        }

        public async Task<DanhMuc?> GetDanhMucWithSanPhamsAsync(int danhMucId)
        {
            return await _unitOfWork.DanhMuc.GetDanhMucWithSanPhamsAsync(danhMucId);
        }

        public async Task<DanhMuc> CreateAsync(DanhMuc danhMuc)
        {
            danhMuc.TrangThai = true;
            await _unitOfWork.DanhMuc.AddAsync(danhMuc);
            await _unitOfWork.SaveChangesAsync();
            return danhMuc;
        }

        public async Task<DanhMuc?> UpdateAsync(int id, DanhMuc danhMuc)
        {
            var existingDanhMuc = await _unitOfWork.DanhMuc.GetByIdAsync(id);
            if (existingDanhMuc == null)
                return null;

            existingDanhMuc.TenDanhMuc = danhMuc.TenDanhMuc;
            existingDanhMuc.MoTa = danhMuc.MoTa;
            existingDanhMuc.TrangThai = danhMuc.TrangThai;

            _unitOfWork.DanhMuc.Update(existingDanhMuc);
            await _unitOfWork.SaveChangesAsync();
            return existingDanhMuc;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var danhMuc = await _unitOfWork.DanhMuc.GetByIdAsync(id);
            if (danhMuc == null)
                return false;

            _unitOfWork.DanhMuc.Remove(danhMuc);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateTrangThaiAsync(int id, bool trangThai)
        {
            var danhMuc = await _unitOfWork.DanhMuc.GetByIdAsync(id);
            if (danhMuc == null)
                return false;

            danhMuc.TrangThai = trangThai;
            _unitOfWork.DanhMuc.Update(danhMuc);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
