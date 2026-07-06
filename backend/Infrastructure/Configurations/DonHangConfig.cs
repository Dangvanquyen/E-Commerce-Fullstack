using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Configurations
{
    public class DonHangConfig : IEntityTypeConfiguration<DonHang>
    {
        public void Configure(EntityTypeBuilder<DonHang> builder)
        {
            builder.ToTable("DonHang");
            builder.HasKey(x => x.DonHangId);

            builder.Property(x => x.TongTien)
                   .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.NguoiDung)
                   .WithMany(n => n.DonHangs)
                   .HasForeignKey(x => x.NguoiDungId);

            builder.HasOne(x => x.ThanhToan)
                   .WithOne(t => t.DonHang)
                   .HasForeignKey<ThanhToan>(t => t.DonHangId);

            builder.Property(x => x.TienGiam)
                   .HasColumnType("decimal(18,2)")
                   .HasDefaultValue(0);

            builder.HasOne(x => x.MaGiamGia)
                   .WithMany(m => m.DonHangs)
                   .HasForeignKey(x => x.MaGiamGiaId)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }

}
