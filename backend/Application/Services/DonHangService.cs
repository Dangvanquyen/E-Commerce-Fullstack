using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class DonHangService : IDonHangService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IThongBaoService _thongBaoService;
        private readonly IMaGiamGiaService _maGiamGiaService;

        public DonHangService(IUnitOfWork unitOfWork, IThongBaoService thongBaoService, IMaGiamGiaService maGiamGiaService)
        {
            _unitOfWork = unitOfWork;
            _thongBaoService = thongBaoService;
            _maGiamGiaService = maGiamGiaService;
        }

        public async Task<IEnumerable<DonHang>> GetAllAsync()
        {
            return await _unitOfWork.DonHang.GetAllAsync();
        }

        public async Task<(IEnumerable<DonHang> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize)
        {
            return await _unitOfWork.DonHang.GetPagedAsync(pageNumber, pageSize);
        }

        public async Task<DonHang?> GetByIdAsync(int id)
        {
            return await _unitOfWork.DonHang.GetByIdAsync(id);
        }

        public async Task<DonHang?> GetDonHangWithChiTietsAsync(int donHangId)
        {
            return await _unitOfWork.DonHang.GetDonHangWithChiTietsAsync(donHangId);
        }

        public async Task<DonHang?> GetDonHangWithThanhToanAsync(int donHangId)
        {
            return await _unitOfWork.DonHang.GetDonHangWithThanhToanAsync(donHangId);
        }

        public async Task<DonHang?> GetDonHangFullInfoAsync(int donHangId)
        {
            return await _unitOfWork.DonHang.GetDonHangFullInfoAsync(donHangId);
        }

        public async Task<IEnumerable<DonHang>> GetDonHangsByNguoiDungAsync(int nguoiDungId)
        {
            return await _unitOfWork.DonHang.GetDonHangsByNguoiDungAsync(nguoiDungId);
        }

        public async Task<IEnumerable<DonHang>> GetDonHangsByTrangThaiAsync(string trangThai)
        {
            return await _unitOfWork.DonHang.GetDonHangsByTrangThaiAsync(trangThai);
        }

        public async Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByNguoiDungAsync(
            int nguoiDungId, int pageNumber, int pageSize)
        {
            return await _unitOfWork.DonHang.GetDonHangsPagedByNguoiDungAsync(nguoiDungId, pageNumber, pageSize);
        }

        public async Task<(IEnumerable<DonHang> Items, int TotalCount)> GetDonHangsPagedByTrangThaiAsync(
            string trangThai, int pageNumber, int pageSize)
        {
            return await _unitOfWork.DonHang.GetDonHangsPagedByTrangThaiAsync(trangThai, pageNumber, pageSize);
        }

        public async Task<DonHang> CreateAsync(DonHang donHang)
        {
            donHang.NgayDat = DateTime.Now;
            donHang.TrangThai = "ChoXuLy";

            await _unitOfWork.DonHang.AddAsync(donHang);
            await _unitOfWork.SaveChangesAsync();
            return donHang;
        }

        public async Task<DonHang> CreateFromGioHangAsync(int nguoiDungId, string diaChiGiaoHang, string phuongThucThanhToan = "COD", string? voucherCode = null, List<int>? gioHangChiTietIds = null)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Lấy giỏ hàng với chi tiết
                var gioHang = await _unitOfWork.GioHang.GetGioHangFullInfoAsync(nguoiDungId);
                if (gioHang == null || gioHang.GioHangChiTiets == null || !gioHang.GioHangChiTiets.Any())
                {
                    throw new InvalidOperationException("Giỏ hàng trống");
                }

                // Lưu danh sách chi tiết giỏ hàng để dùng xuyên suốt (tránh re-query gây duplicate tracking)
                var gioHangChiTietList = gioHang.GioHangChiTiets.ToList();

                if (gioHangChiTietIds != null && gioHangChiTietIds.Any())
                {
                    gioHangChiTietList = gioHangChiTietList.Where(x => gioHangChiTietIds.Contains(x.GioHangChiTietId)).ToList();
                    if (!gioHangChiTietList.Any())
                    {
                        throw new InvalidOperationException("Không tìm thấy sản phẩm được chọn trong giỏ hàng");
                    }
                }

                // Tính tổng tiền
                decimal tongTien = 0;
                foreach (var chiTiet in gioHangChiTietList)
                {
                    tongTien += chiTiet.SoLuong * chiTiet.SanPhamChiTiet.GiaBan;
                }

                decimal tienGiam = 0;
                int? maGiamGiaId = null;

                if (!string.IsNullOrWhiteSpace(voucherCode))
                {
                    var (isValid, discountAmount, message) = await _maGiamGiaService.ValidateVoucherAsync(voucherCode, tongTien);
                    if (!isValid)
                    {
                        throw new InvalidOperationException(message);
                    }
                    
                    var voucher = await _unitOfWork.MaGiamGia.GetByCodeAsync(voucherCode.Trim().ToUpper());
                    if (voucher != null)
                    {
                        maGiamGiaId = voucher.MaGiamGiaId;
                        tienGiam = discountAmount;
                        
                        // Tăng số lượt đã sử dụng
                        voucher.SoLuongDaDung += 1;
                        _unitOfWork.MaGiamGia.Update(voucher);
                    }
                }

                decimal tongTienSauGiam = Math.Max(0, tongTien - tienGiam);

                // Tạo đơn hàng
                var donHang = new DonHang
                {
                    NguoiDungId = nguoiDungId,
                    TongTien = tongTienSauGiam,
                    TrangThai = "ChoXuLy",
                    DiaChiGiaoHang = diaChiGiaoHang,
                    NgayDat = DateTime.Now,
                    MaGiamGiaId = maGiamGiaId,
                    TienGiam = tienGiam
                };

                await _unitOfWork.DonHang.AddAsync(donHang);
                await _unitOfWork.SaveChangesAsync();

                // Tạo chi tiết đơn hàng từ giỏ hàng
                foreach (var gioHangChiTiet in gioHangChiTietList)
                {
                    var donHangChiTiet = new DonHangChiTiet
                    {
                        DonHangId = donHang.DonHangId,
                        SanPhamChiTietId = gioHangChiTiet.SanPhamChiTietId,
                        SoLuong = gioHangChiTiet.SoLuong,
                        DonGia = (int)gioHangChiTiet.SanPhamChiTiet.GiaBan
                    };

                    await _unitOfWork.DonHangChiTiet.AddAsync(donHangChiTiet);

                    // Giảm số lượng tồn kho — dùng trực tiếp entity đã loaded (không re-query)
                    // KHÔNG gọi Update() vì entity đã được EF track qua Include — chỉ cần sửa property
                    var sanPhamChiTiet = gioHangChiTiet.SanPhamChiTiet;
                    sanPhamChiTiet.SoLuongTon -= gioHangChiTiet.SoLuong;
                }

                // Xóa giỏ hàng — dùng trực tiếp danh sách đã loaded (không re-query)
                _unitOfWork.GioHangChiTiet.RemoveRange(gioHangChiTietList);

                // Tạo thanh toán trong cùng transaction (tránh concurrency exception)
                var thanhToan = new ThanhToan
                {
                    DonHangId = donHang.DonHangId,
                    PhuongThuc = phuongThucThanhToan,
                    TrangThai = "ChuaThanhToan",
                    NgayThanhToan = null
                };
                await _unitOfWork.ThanhToan.AddAsync(thanhToan);

                await _unitOfWork.SaveChangesAsync();

                // Tạo thông báo cho Admin khi có đơn hàng mới
                try
                {
                    var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(nguoiDungId);
                    var customerName = nguoiDung?.HoTen ?? "Khách hàng";
                    await _thongBaoService.TaoThongBaoDonHangMoiAsync(donHang.DonHangId, customerName, donHang.TongTien);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error creating new order notification: {ex.Message}");
                }

                await _unitOfWork.CommitTransactionAsync();
                return donHang;
            }
            catch (DbUpdateConcurrencyException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Dữ liệu đã được thay đổi bởi một giao dịch khác (tồn kho/giỏ hàng). Vui lòng tải lại và thử lại.");
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<DonHang> CreateDirectAsync(int nguoiDungId, string diaChiGiaoHang, List<(int SanPhamChiTietId, int SoLuong, decimal DonGia)> items, string phuongThucThanhToan = "COD", string? voucherCode = null)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                if (items == null || !items.Any())
                {
                    throw new InvalidOperationException("Danh sách sản phẩm trống");
                }

                // Tính tổng tiền
                decimal tongTien = items.Sum(item => item.SoLuong * item.DonGia);

                decimal tienGiam = 0;
                int? maGiamGiaId = null;

                if (!string.IsNullOrWhiteSpace(voucherCode))
                {
                    var (isValid, discountAmount, message) = await _maGiamGiaService.ValidateVoucherAsync(voucherCode, tongTien);
                    if (!isValid)
                    {
                        throw new InvalidOperationException(message);
                    }
                    
                    var voucher = await _unitOfWork.MaGiamGia.GetByCodeAsync(voucherCode.Trim().ToUpper());
                    if (voucher != null)
                    {
                        maGiamGiaId = voucher.MaGiamGiaId;
                        tienGiam = discountAmount;
                        
                        // Tăng số lượt đã sử dụng
                        voucher.SoLuongDaDung += 1;
                        _unitOfWork.MaGiamGia.Update(voucher);
                    }
                }

                decimal tongTienSauGiam = Math.Max(0, tongTien - tienGiam);

                // Tạo đơn hàng
                var donHang = new DonHang
                {
                    NguoiDungId = nguoiDungId,
                    TongTien = tongTienSauGiam,
                    TrangThai = "ChoXuLy",
                    DiaChiGiaoHang = diaChiGiaoHang,
                    NgayDat = DateTime.Now,
                    MaGiamGiaId = maGiamGiaId,
                    TienGiam = tienGiam
                };

                await _unitOfWork.DonHang.AddAsync(donHang);
                await _unitOfWork.SaveChangesAsync();

                // Tạo chi tiết đơn hàng
                foreach (var item in items)
                {
                    // Kiểm tra tồn kho
                    var sanPhamChiTiet = await _unitOfWork.SanPhamChiTiet.GetByIdAsync(item.SanPhamChiTietId);
                    if (sanPhamChiTiet == null)
                    {
                        throw new InvalidOperationException($"Không tìm thấy sản phẩm chi tiết ID: {item.SanPhamChiTietId}");
                    }

                    if (sanPhamChiTiet.SoLuongTon < item.SoLuong)
                    {
                        throw new InvalidOperationException($"Sản phẩm không đủ số lượng trong kho");
                    }

                    var donHangChiTiet = new DonHangChiTiet
                    {
                        DonHangId = donHang.DonHangId,
                        SanPhamChiTietId = item.SanPhamChiTietId,
                        SoLuong = item.SoLuong,
                        DonGia = (int)item.DonGia
                    };

                    await _unitOfWork.DonHangChiTiet.AddAsync(donHangChiTiet);

                    // Giảm số lượng tồn kho
                    // KHÔNG gọi Update() vì entity đã được EF track qua FindAsync — chỉ cần sửa property
                    sanPhamChiTiet.SoLuongTon -= item.SoLuong;
                }

                // Tạo thanh toán trong cùng transaction (tránh concurrency exception)
                var thanhToan = new ThanhToan
                {
                    DonHangId = donHang.DonHangId,
                    PhuongThuc = phuongThucThanhToan,
                    TrangThai = "ChuaThanhToan",
                    NgayThanhToan = null
                };
                await _unitOfWork.ThanhToan.AddAsync(thanhToan);

                await _unitOfWork.SaveChangesAsync();

                // Tạo thông báo cho Admin khi có đơn hàng mới
                try
                {
                    var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(nguoiDungId);
                    var customerName = nguoiDung?.HoTen ?? "Khách hàng";
                    await _thongBaoService.TaoThongBaoDonHangMoiAsync(donHang.DonHangId, customerName, donHang.TongTien);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error creating new order notification: {ex.Message}");
                }

                await _unitOfWork.CommitTransactionAsync();
                return donHang;
            }
            catch (DbUpdateConcurrencyException)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new InvalidOperationException("Dữ liệu đã được thay đổi bởi một giao dịch khác (tồn kho). Vui lòng tải lại và thử lại.");
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<DonHang?> UpdateAsync(int id, DonHang donHang)
        {
            var existingDonHang = await _unitOfWork.DonHang.GetByIdAsync(id);
            if (existingDonHang == null)
                return null;

            existingDonHang.TrangThai = donHang.TrangThai;
            existingDonHang.DiaChiGiaoHang = donHang.DiaChiGiaoHang;
            existingDonHang.TongTien = donHang.TongTien;

            _unitOfWork.DonHang.Update(existingDonHang);
            await _unitOfWork.SaveChangesAsync();
            return existingDonHang;
        }

        public async Task<bool> UpdateTrangThaiAsync(int id, string trangThai)
        {
            var donHang = await _unitOfWork.DonHang.GetByIdAsync(id);
            if (donHang == null)
                return false;

            var oldStatus = donHang.TrangThai;
            donHang.TrangThai = trangThai;
            _unitOfWork.DonHang.Update(donHang);
            await _unitOfWork.SaveChangesAsync();

            // Tạo thông báo cho khách hàng khi cập nhật trạng thái đơn
            try
            {
                await _thongBaoService.TaoThongBaoCapNhatTrangThaiDonHangAsync(donHang.DonHangId, donHang.NguoiDungId, oldStatus, trangThai);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating order status update notification: {ex.Message}");
            }

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var donHang = await _unitOfWork.DonHang.GetByIdAsync(id);
            if (donHang == null)
                return false;

            _unitOfWork.DonHang.Remove(donHang);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
