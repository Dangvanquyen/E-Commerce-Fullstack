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
    public class NguoiDungService : INguoiDungService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NguoiDungService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<NguoiDung>> GetAllAsync()
        {
            return await _unitOfWork.NguoiDung.GetAllAsync();
        }

        public async Task<(IEnumerable<NguoiDung> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _unitOfWork.NguoiDung.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<NguoiDung?> GetByIdAsync(int id)
        {
            return await _unitOfWork.NguoiDung.GetByIdAsync(id);
        }

        public async Task<NguoiDung?> GetByEmailAsync(string email)
        {
            return await _unitOfWork.NguoiDung.GetByEmailAsync(email);
        }

        public async Task<NguoiDung?> GetByTenDangNhapAsync(string tenDangNhap)
        {
            return await _unitOfWork.NguoiDung.GetByTenDangNhapAsync(tenDangNhap);
        }

        public async Task<NguoiDung?> GetNguoiDungWithVaiTroAsync(int nguoiDungId)
        {
            return await _unitOfWork.NguoiDung.GetNguoiDungWithVaiTroAsync(nguoiDungId);
        }

        public async Task<NguoiDung?> GetNguoiDungWithGioHangAsync(int nguoiDungId)
        {
            return await _unitOfWork.NguoiDung.GetNguoiDungWithGioHangAsync(nguoiDungId);
        }

        public async Task<NguoiDung?> GetNguoiDungWithDonHangsAsync(int nguoiDungId)
        {
            return await _unitOfWork.NguoiDung.GetNguoiDungWithDonHangsAsync(nguoiDungId);
        }

        public async Task<IEnumerable<NguoiDung>> GetNguoiDungsByVaiTroAsync(int vaiTroId)
        {
            return await _unitOfWork.NguoiDung.GetNguoiDungsByVaiTroAsync(vaiTroId);
        }

        public async Task<NguoiDung> CreateAsync(NguoiDung nguoiDung)
        {
            nguoiDung.NgayTao = DateTime.Now;
            nguoiDung.TrangThai = true;

            await _unitOfWork.NguoiDung.AddAsync(nguoiDung);
            await _unitOfWork.SaveChangesAsync();

            // Tạo giỏ hàng cho người dùng mới
            var gioHang = new GioHang
            {
                NguoiDungId = nguoiDung.NguoiDungId,
                NgayTao = DateTime.Now
            };
            await _unitOfWork.GioHang.AddAsync(gioHang);
            await _unitOfWork.SaveChangesAsync();

            return nguoiDung;
        }

        public async Task<NguoiDung?> UpdateAsync(int id, NguoiDung nguoiDung)
        {
            var existingNguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(id);
            if (existingNguoiDung == null)
                return null;

            // Keep existing username stable during profile updates.
            // Update request does not include TenDangNhap, so overriding it can break DB constraints.
            existingNguoiDung.HoTen = nguoiDung.HoTen;
            existingNguoiDung.Email = nguoiDung.Email;
            existingNguoiDung.SoDienThoai = nguoiDung.SoDienThoai;
            existingNguoiDung.DiaChi = nguoiDung.DiaChi;
            existingNguoiDung.Avatar = nguoiDung.Avatar;
            existingNguoiDung.VaiTroId = nguoiDung.VaiTroId;

            if (!string.IsNullOrEmpty(nguoiDung.MatKhau))
            {
                existingNguoiDung.MatKhau = nguoiDung.MatKhau;
            }

            _unitOfWork.NguoiDung.Update(existingNguoiDung);
            await _unitOfWork.SaveChangesAsync();
            return existingNguoiDung;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(id);
            if (nguoiDung == null)
                return false;

            _unitOfWork.NguoiDung.Remove(nguoiDung);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsEmailExistsAsync(string email)
        {
            return await _unitOfWork.NguoiDung.IsEmailExistsAsync(email);
        }

        public async Task<bool> IsTenDangNhapExistsAsync(string tenDangNhap)
        {
            return await _unitOfWork.NguoiDung.IsTenDangNhapExistsAsync(tenDangNhap);
        }

        public async Task<bool> UpdateTrangThaiAsync(int id, bool trangThai)
        {
            var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(id);
            if (nguoiDung == null)
                return false;

            nguoiDung.TrangThai = trangThai;
            _unitOfWork.NguoiDung.Update(nguoiDung);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateVaiTroAsync(int id, int vaiTroId)
        {
            var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(id);
            if (nguoiDung == null)
                return false;

            nguoiDung.VaiTroId = vaiTroId;
            _unitOfWork.NguoiDung.Update(nguoiDung);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
