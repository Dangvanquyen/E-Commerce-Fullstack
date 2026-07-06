using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Configurations
{
    public class ChatMessageConfig : IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.HasKey(cm => cm.ChatMessageId);

            builder.Property(cm => cm.NoiDung)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(cm => cm.IsFromAdmin)
                .HasDefaultValue(false);

            builder.Property(cm => cm.DaDoc)
                .HasDefaultValue(false);

            builder.Property(cm => cm.NgayGui)
                .HasDefaultValueSql("GETDATE()");

            builder.HasOne(cm => cm.ChatRoom)
                .WithMany(cr => cr.ChatMessages)
                .HasForeignKey(cm => cm.ChatRoomId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(cm => cm.NguoiDung)
                .WithMany()
                .HasForeignKey(cm => cm.NguoiDungId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}