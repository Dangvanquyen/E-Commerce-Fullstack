using Application.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var portStr = _configuration["EmailSettings:Port"] ?? "587";
            var senderName = _configuration["EmailSettings:SenderName"] ?? "FashionStore";
            var senderEmail = _configuration["EmailSettings:SenderEmail"] ?? "";
            var username = _configuration["EmailSettings:Username"] ?? "";
            var password = _configuration["EmailSettings:Password"] ?? "";

            if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(password))
            {
                throw new InvalidOperationException("Email settings are not properly configured in appsettings.json. Please configure EmailSettings section.");
            }

            int port = int.TryParse(portStr, out var parsedPort) ? parsedPort : 587;

            using var client = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(senderEmail, senderName),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            await client.SendMailAsync(mailMessage);
        }
    }
}
