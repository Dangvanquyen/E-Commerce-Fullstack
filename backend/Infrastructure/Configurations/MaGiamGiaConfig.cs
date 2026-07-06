using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class MaGiamGiaConfig : IEntityTypeConfiguration<MaGiamGia>
    {
        public void Configure(EntityTypeBuilder<MaGiamGia> builder)
        {
            builder.ToTable("MaGiamGia");
            builder.HasKey(x => x.MaGiamGiaId);

            builder.Property(x => x.Code)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.HasIndex(x => x.Code)
                   .IsUnique();

            builder.Property(x => x.MoTa)
                   .HasMaxLength(250);

            builder.Property(x => x.LoaiGiamGia)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("PhanTram");

            builder.Property(x => x.GiaTri)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.GiaTriGiamToiDa)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.DonHangToiThieu)
                   .HasColumnType("decimal(18,2)");
        }
    }
}
