using Domain.Interfaces;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction? _transaction;

        private IVaiTroRepository? _vaiTro;
        private INguoiDungRepository? _nguoiDung;
        private IDanhMucRepository? _danhMuc;
        private ISanPhamRepository? _sanPham;
        private ISanPhamChiTietRepository? _sanPhamChiTiet;
        private IGioHangRepository? _gioHang;
        private IGioHangChiTietRepository? _gioHangChiTiet;
        private IDonHangRepository? _donHang;
        private IDonHangChiTietRepository? _donHangChiTiet;
        private IThanhToanRepository? _thanhToan;
        private IYeuThichRepository? _yeuThich;
        private IChatRoomRepository? _chatRoom;
        private IChatMessageRepository? _chatMessage;
        private IThongBaoRepository? _thongBao;
        private IMaGiamGiaRepository? _maGiamGia;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IVaiTroRepository VaiTro => 
            _vaiTro ??= new VaiTroRepository(_context);

        public INguoiDungRepository NguoiDung => 
            _nguoiDung ??= new NguoiDungRepository(_context);

        public IDanhMucRepository DanhMuc => 
            _danhMuc ??= new DanhMucRepository(_context);

        public ISanPhamRepository SanPham => 
            _sanPham ??= new SanPhamRepository(_context);

        public ISanPhamChiTietRepository SanPhamChiTiet => 
            _sanPhamChiTiet ??= new SanPhamChiTietRepository(_context);

        public IGioHangRepository GioHang => 
            _gioHang ??= new GioHangRepository(_context);

        public IGioHangChiTietRepository GioHangChiTiet => 
            _gioHangChiTiet ??= new GioHangChiTietRepository(_context);

        public IDonHangRepository DonHang => 
            _donHang ??= new DonHangRepository(_context);

        public IDonHangChiTietRepository DonHangChiTiet => 
            _donHangChiTiet ??= new DonHangChiTietRepository(_context);

        public IThanhToanRepository ThanhToan => 
            _thanhToan ??= new ThanhToanRepository(_context);

        public IYeuThichRepository YeuThich => 
            _yeuThich ??= new YeuThichRepository(_context);

        public IChatRoomRepository ChatRoom => 
            _chatRoom ??= new ChatRoomRepository(_context);

        public IChatMessageRepository ChatMessage => 
            _chatMessage ??= new ChatMessageRepository(_context);

        public IThongBaoRepository ThongBao => 
            _thongBao ??= new ThongBaoRepository(_context);

        public IMaGiamGiaRepository MaGiamGia => 
            _maGiamGia ??= new MaGiamGiaRepository(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}
