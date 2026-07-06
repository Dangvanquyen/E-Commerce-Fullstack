using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class ChatRoomConfig : IEntityTypeConfiguration<ChatRoom>
    {
        public void Configure(EntityTypeBuilder<ChatRoom> builder)
        {
            builder.HasKey(cr => cr.ChatRoomId);

            builder.Property(cr => cr.RoomName)
                .HasMaxLength(255);

            builder.Property(cr => cr.IsActive)
                .HasDefaultValue(true);

            builder.Property(cr => cr.NgayTao)
                .HasDefaultValueSql("GETDATE()");

            builder.HasOne(cr => cr.NguoiDung)
                .WithMany()
                .HasForeignKey(cr => cr.NguoiDungId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(cr => cr.ChatMessages)
                .WithOne(cm => cm.ChatRoom)
                .HasForeignKey(cm => cm.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}