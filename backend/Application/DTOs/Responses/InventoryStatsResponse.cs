namespace Application.DTOs.Responses
{
    public class InventoryStatsResponse
    {
        public int TotalVariants { get; set; }
        public int TotalProductsCount { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
    }
}
