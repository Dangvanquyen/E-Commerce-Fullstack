using Application.DTOs.Requests;
using Application.DTOs.Responses;
using AutoMapper;
using Domain.Entities;

namespace Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // SanPham mappings
            CreateMap<SanPham, SanPhamResponse>()
                .ForMember(dest => dest.DanhMucTen, opt => opt.MapFrom(src => src.DanhMuc != null ? src.DanhMuc.TenDanhMuc : string.Empty))
                .ForMember(dest => dest.SanPhamChiTiets, opt => opt.MapFrom(src => src.SanPhamChiTiets));
            CreateMap<CreateSanPhamRequest, SanPham>();
            CreateMap<UpdateSanPhamRequest, SanPham>();

            // DanhMuc mappings
            CreateMap<DanhMuc, DanhMucResponse>();
            CreateMap<CreateDanhMucRequest, DanhMuc>();
            CreateMap<UpdateDanhMucRequest, DanhMuc>();

            // MaGiamGia mappings
            CreateMap<MaGiamGia, MaGiamGiaResponse>();
            CreateMap<CreateMaGiamGiaRequest, MaGiamGia>();
            CreateMap<UpdateMaGiamGiaRequest, MaGiamGia>();

            // NguoiDung mappings
            CreateMap<NguoiDung, NguoiDungResponse>()
                .ForMember(dest => dest.VaiTroTen, opt => opt.MapFrom(src => src.VaiTro != null ? src.VaiTro.TenVaiTro : string.Empty));
            CreateMap<RegisterRequest, NguoiDung>();
            CreateMap<UpdateNguoiDungRequest, NguoiDung>();

            // VaiTro mappings
            CreateMap<VaiTro, VaiTroResponse>();
            CreateMap<CreateVaiTroRequest, VaiTro>();
            CreateMap<UpdateVaiTroRequest, VaiTro>();

            // GioHang mappings
            CreateMap<GioHang, GioHangResponse>()
                .ForMember(dest => dest.ChiTiets, opt => opt.MapFrom(src => src.GioHangChiTiets))
                .ForMember(dest => dest.TongTien, opt => opt.MapFrom(src => 
                    src.GioHangChiTiets != null 
                        ? src.GioHangChiTiets.Sum(ct => ct.SoLuong * (ct.SanPhamChiTiet != null ? ct.SanPhamChiTiet.GiaBan : 0))
                        : 0));

            // GioHangChiTiet mappings
            CreateMap<GioHangChiTiet, GioHangChiTietResponse>()
                .ForMember(dest => dest.SanPhamId, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.SanPhamId : 0))
                .ForMember(dest => dest.TenSanPham, opt => opt.MapFrom(src => 
                    src.SanPhamChiTiet != null && src.SanPhamChiTiet.SanPham != null 
                        ? src.SanPhamChiTiet.SanPham.TenSanPham : string.Empty))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => 
                    src.SanPhamChiTiet != null 
                        ? (src.SanPhamChiTiet.HinhAnh ?? (src.SanPhamChiTiet.SanPham != null ? src.SanPhamChiTiet.SanPham.HinhAnh : null))
                        : null))
                .ForMember(dest => dest.Size, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.Size : string.Empty))
                .ForMember(dest => dest.MauSac, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.MauSac : string.Empty))
                .ForMember(dest => dest.GiaBan, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.GiaBan : 0))
                .ForMember(dest => dest.ThanhTien, opt => opt.MapFrom(src => 
                    src.SoLuong * (src.SanPhamChiTiet != null ? src.SanPhamChiTiet.GiaBan : 0)));

            // DonHang mappings
            CreateMap<DonHang, DonHangResponse>()
                .ForMember(dest => dest.TenNguoiDung, opt => opt.MapFrom(src => src.NguoiDung != null ? src.NguoiDung.HoTen : string.Empty))
                .ForMember(dest => dest.VoucherCode, opt => opt.MapFrom(src => src.MaGiamGia != null ? src.MaGiamGia.Code : string.Empty))
                .ForMember(dest => dest.ChiTiets, opt => opt.MapFrom(src => src.DonHangChiTiets));

            // DonHangChiTiet mappings
            CreateMap<DonHangChiTiet, DonHangChiTietResponse>()
                .ForMember(dest => dest.SanPhamId, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.SanPhamId : 0))
                .ForMember(dest => dest.TenSanPham, opt => opt.MapFrom(src => 
                    src.SanPhamChiTiet != null && src.SanPhamChiTiet.SanPham != null 
                        ? src.SanPhamChiTiet.SanPham.TenSanPham : string.Empty))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => 
                    src.SanPhamChiTiet != null 
                        ? (src.SanPhamChiTiet.HinhAnh ?? (src.SanPhamChiTiet.SanPham != null ? src.SanPhamChiTiet.SanPham.HinhAnh : null))
                        : null))
                .ForMember(dest => dest.Size, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.Size : string.Empty))
                .ForMember(dest => dest.MauSac, opt => opt.MapFrom(src => src.SanPhamChiTiet != null ? src.SanPhamChiTiet.MauSac : string.Empty))
                .ForMember(dest => dest.ThanhTien, opt => opt.MapFrom(src => src.SoLuong * src.DonGia));

            // SanPhamChiTiet mappings
            CreateMap<SanPhamChiTiet, SanPhamChiTietSimpleResponse>()
                .ForMember(dest => dest.SoLuongTon, opt => opt.MapFrom(src => src.SoLuongTon));
            CreateMap<SanPhamChiTiet, SanPhamChiTietResponse>()
                .ForMember(dest => dest.TenSanPham, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.TenSanPham : string.Empty))
                .ForMember(dest => dest.TenDanhMuc, opt => opt.MapFrom(src => src.SanPham != null && src.SanPham.DanhMuc != null ? src.SanPham.DanhMuc.TenDanhMuc : string.Empty))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => src.HinhAnh ?? (src.SanPham != null ? src.SanPham.HinhAnh : null)))
                .ForMember(dest => dest.SoLuongTon, opt => opt.MapFrom(src => src.SoLuongTon));
            CreateMap<CreateSanPhamChiTietRequest, SanPhamChiTiet>();
            CreateMap<UpdateSanPhamChiTietRequest, SanPhamChiTiet>();

            // ThanhToan mappings
            CreateMap<ThanhToan, ThanhToanResponse>();

            // YeuThich mappings
            CreateMap<YeuThich, YeuThichResponse>()
                .ForMember(dest => dest.TenSanPham, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.TenSanPham : string.Empty))
                .ForMember(dest => dest.HinhAnh, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.HinhAnh : null))
                .ForMember(dest => dest.Gia, opt => opt.MapFrom(src => src.SanPham != null ? src.SanPham.Gia : 0))
                .ForMember(dest => dest.TrangThai, opt => opt.MapFrom(src => src.SanPham != null && src.SanPham.TrangThai));

            // Chat mappings
            CreateMap<ChatRoom, ChatRoomResponse>()
                .ForMember(dest => dest.TenNguoiDung, opt => opt.MapFrom(src => src.NguoiDung != null ? src.NguoiDung.HoTen : string.Empty))
                .ForMember(dest => dest.Messages, opt => opt.MapFrom(src => src.ChatMessages));
            
            CreateMap<ChatMessage, ChatMessageResponse>()
                .ForMember(dest => dest.TenNguoiDung, opt => opt.MapFrom(src => src.NguoiDung != null ? src.NguoiDung.HoTen : string.Empty));
        }
    }
}
