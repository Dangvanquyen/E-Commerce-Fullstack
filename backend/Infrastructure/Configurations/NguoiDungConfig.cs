using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Infrastructure.Configurations
{
        public class NguoiDungConfig : IEntityTypeConfiguration<NguoiDung>
        {
            public void Configure(EntityTypeBuilder<NguoiDung> builder)
            {
                builder.ToTable("NguoiDung");
                builder.HasKey(x => x.NguoiDungId);

                builder.Property(x => x.TenDangNhap).IsRequired().HasMaxLength(100);
                builder.Property(x => x.MatKhau).IsRequired();
                builder.Property(x => x.Email).HasMaxLength(150);
                builder.Property(x => x.Avatar).HasMaxLength(500);

                builder.HasOne(x => x.VaiTro)
                       .WithMany(v => v.NguoiDungs)
                       .HasForeignKey(x => x.VaiTroId);

                builder.HasOne(x => x.GioHang)
                       .WithOne(g => g.NguoiDung)
                       .HasForeignKey<GioHang>(g => g.NguoiDungId);
            }
        }
    
}
