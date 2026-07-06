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
    public class DanhMucConfig : IEntityTypeConfiguration<DanhMuc>
    {
        public void Configure(EntityTypeBuilder<DanhMuc> builder)
        {
            builder.ToTable("DanhMuc");
            builder.HasKey(x => x.DanhMucId);

            builder.Property(x => x.TenDanhMuc)
                   .IsRequired()
                   .HasMaxLength(150);
        }
    }

}
