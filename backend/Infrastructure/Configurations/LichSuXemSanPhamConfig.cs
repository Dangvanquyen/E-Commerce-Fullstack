using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class LichSuXemSanPhamConfig : IEntityTypeConfiguration<LichSuXemSanPham>
    {
        public void Configure(EntityTypeBuilder<LichSuXemSanPham> builder)
        {
            builder.ToTable("LichSuXemSanPham");

            builder.HasKey(x => x.LichSuId);

            builder.Property(x => x.SessionId)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.IPAddress)
                .HasMaxLength(50);

            builder.Property(x => x.UserAgent)
                .HasMaxLength(500);

            builder.HasOne(x => x.SanPham)
                .WithMany()
                .HasForeignKey(x => x.SanPhamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.NguoiDung)
                .WithMany()
                .HasForeignKey(x => x.NguoiDungId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            // Index để query nhanh
            builder.HasIndex(x => x.SanPhamId);
            builder.HasIndex(x => x.ThoiGianVao);
            builder.HasIndex(x => new { x.SanPhamId, x.ThoiGianVao });
        }
    }
}
