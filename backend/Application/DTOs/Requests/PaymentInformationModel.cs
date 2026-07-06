namespace Application.DTOs.Requests
{
    public class PaymentInformationModel
    {
        public string OrderType { get; set; } = "billpayment";
        public double Amount { get; set; }
        public string OrderDescription { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
