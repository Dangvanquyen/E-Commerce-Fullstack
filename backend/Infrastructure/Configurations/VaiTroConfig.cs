using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class VaiTroConfig : IEntityTypeConfiguration<VaiTro>
    {
        public void Configure(EntityTypeBuilder<VaiTro> builder)
        {
            builder.ToTable("VaiTro");
            builder.HasKey(x => x.VaiTroId);

            builder.Property(x => x.TenVaiTro)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(x => x.MoTa)
                   .HasMaxLength(255);
        }
    }
}
