using Application.DTOs.Responses;
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
    public class GioHangService : IGioHangService
    {
        private readonly IUnitOfWork _unitOfWork;

        public GioHangService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<GioHang?> GetByIdAsync(int id)
        {
            return await _unitOfWork.GioHang.GetByIdAsync(id);
        }

        public async Task<GioHang?> GetGioHangByNguoiDungAsync(int nguoiDungId)
        {
            return await _unitOfWork.GioHang.GetGioHangByNguoiDungAsync(nguoiDungId);
        }

        public async Task<GioHang?> GetGioHangWithChiTietsAsync(int gioHangId)
        {
            return await _unitOfWork.GioHang.GetGioHangWithChiTietsAsync(gioHangId);
        }

        public async Task<GioHang?> GetGioHangFullInfoAsync(int nguoiDungId)
        {
            return await _unitOfWork.GioHang.GetGioHangFullInfoAsync(nguoiDungId);
        }

        public async Task<GioHang> CreateAsync(int nguoiDungId)
        {
            var gioHang = new GioHang
            {
                NguoiDungId = nguoiDungId,
                NgayTao = DateTime.Now
            };

            await _unitOfWork.GioHang.AddAsync(gioHang);
            await _unitOfWork.SaveChangesAsync();
            return gioHang;
        }

        public async Task<GioHang?> GetOrCreateGioHangAsync(int nguoiDungId)
        {
            var gioHang = await _unitOfWork.GioHang.GetGioHangByNguoiDungAsync(nguoiDungId);
            if (gioHang == null)
            {
                gioHang = await CreateAsync(nguoiDungId);
            }
            return gioHang;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var gioHang = await _unitOfWork.GioHang.GetByIdAsync(id);
            if (gioHang == null)
                return false;

            _unitOfWork.GioHang.Remove(gioHang);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearGioHangAsync(int nguoiDungId)
        {
            var gioHang = await _unitOfWork.GioHang.GetGioHangByNguoiDungAsync(nguoiDungId);
            if (gioHang == null)
                return false;

            await _unitOfWork.GioHangChiTiet.RemoveAllByGioHangAsync(gioHang.GioHangId);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<GioHangAdminResponse>> GetAllAbandonedCartsAsync()
        {
            var gioHangs = await _unitOfWork.GioHang.GetAllNonEmptyCartsAsync();
            return gioHangs.Select(MapToAdminResponse);
        }

        public async Task<IEnumerable<SanPhamGioHangChuaMuaResponse>> GetSanPhamTrongGioChuaMuaAsync()
        {
            var gioHangs = await _unitOfWork.GioHang.GetAllNonEmptyCartsAsync();
            var items = gioHangs
                .SelectMany(g => g.GioHangChiTiets.Select(c => new { g.GioHangId, ChiTiet = c }))
                .Where(x => x.ChiTiet.SanPhamChiTiet?.SanPham != null)
                .ToList();

            return items
                .GroupBy(x => x.ChiTiet.SanPhamChiTiet!.SanPham!.SanPhamId)
                .Select(g =>
                {
                    var first = g.First().ChiTiet;
                    var sanPham = first.SanPhamChiTiet!.SanPham!;
                    return new SanPhamGioHangChuaMuaResponse
                    {
                        SanPhamId = sanPham.SanPhamId,
                        TenSanPham = sanPham.TenSanPham,
                        TenDanhMuc = sanPham.DanhMuc?.TenDanhMuc ?? "Khác",
                        SoLuongTrongGio = g.Sum(x => x.ChiTiet.SoLuong),
                        SoGioHang = g.Select(x => x.GioHangId).Distinct().Count(),
                        TongGiaTri = g.Sum(x => (decimal)x.ChiTiet.SoLuong * x.ChiTiet.SanPhamChiTiet!.GiaBan)
                    };
                })
                .OrderByDescending(x => x.SoLuongTrongGio)
                .ToList();
        }

        private static GioHangAdminResponse MapToAdminResponse(GioHang gioHang)
        {
            var chiTiets = gioHang.GioHangChiTiets.Select(c =>
            {
                var spct = c.SanPhamChiTiet;
                var sp = spct?.SanPham;
                var donGia = spct?.GiaBan ?? 0;
                return new GioHangChiTietAdminResponse
                {
                    GioHangChiTietId = c.GioHangChiTietId,
                    SanPhamId = sp?.SanPhamId ?? 0,
                    TenSanPham = sp?.TenSanPham ?? "N/A",
                    TenDanhMuc = sp?.DanhMuc?.TenDanhMuc ?? "Khác",
                    Size = spct?.Size ?? "",
                    MauSac = spct?.MauSac ?? "",
                    SoLuong = c.SoLuong,
                    DonGia = donGia,
                    ThanhTien = c.SoLuong * donGia
                };
            }).ToList();

            return new GioHangAdminResponse
            {
                GioHangId = gioHang.GioHangId,
                NguoiDungId = gioHang.NguoiDungId,
                HoTen = gioHang.NguoiDung?.HoTen ?? "Khách",
                Email = gioHang.NguoiDung?.Email ?? "",
                NgayTao = gioHang.NgayTao,
                TongGiaTri = chiTiets.Sum(c => c.ThanhTien),
                TongSoSanPham = chiTiets.Sum(c => c.SoLuong),
                ChiTiets = chiTiets
            };
        }
    }
}
