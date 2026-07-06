using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class YeuThichConfig : IEntityTypeConfiguration<YeuThich>
    {
        public void Configure(EntityTypeBuilder<YeuThich> builder)
        {
            builder.ToTable("YeuThich");
            builder.HasKey(y => y.YeuThichId);

            builder.Property(y => y.NgayThem)
                .IsRequired();

            builder.HasOne(y => y.NguoiDung)
                .WithMany(n => n.YeuThichs)
                .HasForeignKey(y => y.NguoiDungId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(y => y.SanPham)
                .WithMany(s => s.YeuThichs)
                .HasForeignKey(y => y.SanPhamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: Một user chỉ có thể thích một sản phẩm một lần
            builder.HasIndex(y => new { y.NguoiDungId, y.SanPhamId })
                .IsUnique();
        }
    }
}
