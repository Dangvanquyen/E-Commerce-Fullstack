using Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IAprioriRecommendationService
    {
        /// <summary>
        /// Huấn luyện lại mô hình Apriori dựa trên lịch sử đơn hàng
        /// </summary>
        Task TrainModelAsync();

        /// <summary>
        /// Lấy danh sách sản phẩm gợi ý mua cùng
        /// </summary>
        /// <param name="productId">Mã sản phẩm hiện tại</param>
        /// <param name="limit">Số lượng tối đa</param>
        Task<IEnumerable<SanPham>> GetRecommendationsAsync(int productId, int limit = 4);
    }
}
