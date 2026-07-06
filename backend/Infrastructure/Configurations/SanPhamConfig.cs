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
    public class SanPhamConfig : IEntityTypeConfiguration<SanPham>
    {
        public void Configure(EntityTypeBuilder<SanPham> builder)
        {
            builder.ToTable("SanPham");
            builder.HasKey(x => x.SanPhamId);

            builder.Property(x => x.TenSanPham)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(x => x.MoTa)
                   .HasMaxLength(1000);

            builder.Property(x => x.Gia)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.HinhAnh)
                   .HasMaxLength(500);

            builder.Property(x => x.NgayTao)
                   .HasDefaultValueSql("GETDATE()");

            builder.HasOne(x => x.DanhMuc)
                   .WithMany(d => d.SanPhams)
                   .HasForeignKey(x => x.DanhMucId);
        }
    }
}
