using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebAPIs.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly IAprioriRecommendationService _recommendationService;
        private readonly IMapper _mapper;

        public RecommendationController(IAprioriRecommendationService recommendationService, IMapper mapper)
        {
            _recommendationService = recommendationService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách sản phẩm gợi ý dựa trên thuật toán Apriori
        /// </summary>
        /// <param name="id">Mã sản phẩm hiện tại</param>
        /// <param name="limit">Số lượng tối đa</param>
        [HttpGet("product/{id}")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<SanPhamResponse>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetRecommendations(int id, [FromQuery] int limit = 4)
        {
            var recommendedProducts = await _recommendationService.GetRecommendationsAsync(id, limit);
            var response = _mapper.Map<IEnumerable<SanPhamResponse>>(recommendedProducts);
            return Ok(ApiResponse<IEnumerable<SanPhamResponse>>.SuccessResponse(response));
        }

        /// <summary>
        /// Kích hoạt huấn luyện lại mô hình Apriori (Chỉ dành cho Admin)
        /// </summary>
        [HttpPost("train")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
        public async Task<IActionResult> TrainModel()
        {
            await _recommendationService.TrainModelAsync();
            return Ok(ApiResponse<string>.SuccessResponse("Huấn luyện mô hình Apriori thành công"));
        }
    }
}
