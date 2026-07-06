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
    public class SanPhamChiTietConfig : IEntityTypeConfiguration<SanPhamChiTiet>
    {
        public void Configure(EntityTypeBuilder<SanPhamChiTiet> builder)
        {
            builder.ToTable("SanPhamChiTiet");
            builder.HasKey(x => x.SanPhamChiTietId);

            builder.Property(x => x.Size)
                   .HasMaxLength(50);

            builder.Property(x => x.MauSac)
                   .HasMaxLength(100);

            builder.Property(x => x.GiaBan)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.HinhAnh)
                   .HasMaxLength(500);

            builder.HasOne(x => x.SanPham)
                   .WithMany(s => s.SanPhamChiTiets)
                   .HasForeignKey(x => x.SanPhamId);
        }
    }
}
