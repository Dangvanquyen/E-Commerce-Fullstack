using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Microsoft.AspNetCore.Http;

namespace Application.Services.Interfaces
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(PaymentInformationModel model, HttpContext context);
        PaymentResponseModel PaymentExecute(IQueryCollection collections);
    }
}
