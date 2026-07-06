using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class ThongBaoConfig : IEntityTypeConfiguration<ThongBao>
    {
        public void Configure(EntityTypeBuilder<ThongBao> builder)
        {
            builder.ToTable("ThongBao");

            builder.HasKey(x => x.ThongBaoId);

            builder.Property(x => x.TieuDe)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(x => x.NoiDung)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.LoaiThongBao)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("HeThong");

            builder.Property(x => x.LienKet)
                .HasMaxLength(255);

            builder.HasOne(x => x.NguoiDung)
                .WithMany()
                .HasForeignKey(x => x.NguoiDungId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

            // Indexes để tối ưu hóa truy vấn
            builder.HasIndex(x => x.NguoiDungId);
            builder.HasIndex(x => x.NgayTao);
            builder.HasIndex(x => new { x.NguoiDungId, x.DaDoc });
        }
    }
}
