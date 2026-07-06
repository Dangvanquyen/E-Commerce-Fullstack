using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IVaiTroRepository VaiTro { get; }
        INguoiDungRepository NguoiDung { get; }
        IDanhMucRepository DanhMuc { get; }
        ISanPhamRepository SanPham { get; }
        ISanPhamChiTietRepository SanPhamChiTiet { get; }
        IGioHangRepository GioHang { get; }
        IGioHangChiTietRepository GioHangChiTiet { get; }
        IDonHangRepository DonHang { get; }
        IDonHangChiTietRepository DonHangChiTiet { get; }
        IThanhToanRepository ThanhToan { get; }
        IYeuThichRepository YeuThich { get; }
        IChatRoomRepository ChatRoom { get; }
        IChatMessageRepository ChatMessage { get; }
        IThongBaoRepository ThongBao { get; }
        IMaGiamGiaRepository MaGiamGia { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
