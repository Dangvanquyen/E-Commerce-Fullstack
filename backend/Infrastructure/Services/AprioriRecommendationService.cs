using Application.Services.Interfaces;
using Domain.Entities;
using Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class AprioriRecommendationService : IAprioriRecommendationService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "AprioriRules";

        public AprioriRecommendationService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task TrainModelAsync()
        {
            try
            {
                // 1. Lấy lịch sử tất cả các mặt hàng đã thanh toán thành công (giao dịch)
                var orderItemsRaw = await _context.DonHangChiTiet
                    .Where(d => d.DonHang.TrangThai == "HoanThanh")
                    .Select(d => new
                    {
                        d.DonHangId,
                        d.SanPhamChiTiet.SanPhamId,
                        d.SoLuong,
                        d.DonGia
                    })
                    .ToListAsync();

                // Group theo đơn hàng và sản phẩm để tính tổng số lượng & doanh thu của sản phẩm trong đơn đó
                var itemsInOrders = orderItemsRaw
                    .GroupBy(x => new { x.DonHangId, x.SanPhamId })
                    .Select(g => new
                    {
                        g.Key.DonHangId,
                        g.Key.SanPhamId,
                        Quantity = g.Sum(x => x.SoLuong),
                        Utility = (double)g.Sum(x => x.SoLuong * x.DonGia)
                    })
                    .ToList();

                var transactions = itemsInOrders
                    .GroupBy(x => x.DonHangId)
                    .Select(g => new
                    {
                        DonHangId = g.Key,
                        Items = g.ToDictionary(x => x.SanPhamId, x => x.Utility),
                        TU = g.Sum(x => x.Utility)
                    })
                    .ToList();

                if (!transactions.Any())
                {
                    return;
                }

                int totalTransactions = transactions.Count;
                double totalRevenue = transactions.Sum(t => t.TU);

                // Ngưỡng hữu dụng tối thiểu: 1.5% tổng doanh thu, tối thiểu là 100,000đ để xử lý tập dữ liệu nhỏ
                double minUtilityThreshold = Math.Max(100000, totalRevenue * 0.015);

                // GIAI ĐOẠN I: Tìm các tập ứng viên có Hữu dụng trọng số giao dịch cao (HTUIs)
                
                // Bước 1: Tính toán TWU cho từng sản phẩm đơn lẻ (1-itemsets)
                var itemTwu = new Dictionary<int, double>();
                foreach (var transaction in transactions)
                {
                    foreach (var item in transaction.Items.Keys)
                    {
                        if (itemTwu.ContainsKey(item))
                            itemTwu[item] += transaction.TU;
                        else
                            itemTwu[item] = transaction.TU;
                    }
                }

                // Lọc tập ứng viên 1-HTUIs
                var frequent1Itemsets = itemTwu
                    .Where(kvp => kvp.Value >= minUtilityThreshold)
                    .Select(kvp => kvp.Key)
                    .ToHashSet();

                // Bước 2: Tạo tập ứng viên 2-HTUIs (Cặp sản phẩm ứng viên có TWU vượt ngưỡng)
                var pairTwu = new Dictionary<(int, int), double>();
                foreach (var transaction in transactions)
                {
                    var list = transaction.Items.Keys.Where(i => frequent1Itemsets.Contains(i)).ToList();
                    for (int i = 0; i < list.Count; i++)
                    {
                        for (int j = i + 1; j < list.Count; j++)
                        {
                            var item1 = Math.Min(list[i], list[j]);
                            var item2 = Math.Max(list[i], list[j]);
                            var pair = (item1, item2);

                            if (pairTwu.ContainsKey(pair))
                                pairTwu[pair] += transaction.TU;
                            else
                                pairTwu[pair] = transaction.TU;
                        }
                    }
                }

                // Lọc tập ứng viên 2-HTUIs
                var candidate2Itemsets = pairTwu
                    .Where(kvp => kvp.Value >= minUtilityThreshold)
                    .Select(kvp => kvp.Key)
                    .ToList();

                // GIAI ĐOẠN II: Xác định các tập hữu dụng cao thực tế (HUIs) và sinh luật gợi ý
                var rules = new Dictionary<int, List<RecommendationRule>>();

                foreach (var pair in candidate2Itemsets)
                {
                    double actualUtility = 0;
                    int supportCount = 0;

                    foreach (var transaction in transactions)
                    {
                        if (transaction.Items.ContainsKey(pair.Item1) && transaction.Items.ContainsKey(pair.Item2))
                        {
                            actualUtility += transaction.Items[pair.Item1] + transaction.Items[pair.Item2];
                            supportCount++;
                        }
                    }

                    // Nếu hữu dụng thực tế đạt ngưỡng min_utility
                    if (actualUtility >= minUtilityThreshold)
                    {
                        double support = (double)supportCount / totalTransactions;

                        // Tính số lần xuất hiện của từng item để làm Confidence bổ trợ
                        int count1 = transactions.Count(t => t.Items.ContainsKey(pair.Item1));
                        double confidence1 = (double)supportCount / count1;

                        int count2 = transactions.Count(t => t.Items.ContainsKey(pair.Item2));
                        double confidence2 = (double)supportCount / count2;

                        // Luật: Item1 => Item2
                        if (!rules.ContainsKey(pair.Item1))
                            rules[pair.Item1] = new List<RecommendationRule>();

                        rules[pair.Item1].Add(new RecommendationRule
                        {
                            RecommendedProductId = pair.Item2,
                            Confidence = confidence1,
                            Support = support,
                            Utility = actualUtility
                        });

                        // Luật: Item2 => Item1
                        if (!rules.ContainsKey(pair.Item2))
                            rules[pair.Item2] = new List<RecommendationRule>();

                        rules[pair.Item2].Add(new RecommendationRule
                        {
                            RecommendedProductId = pair.Item1,
                            Confidence = confidence2,
                            Support = support,
                            Utility = actualUtility
                        });
                    }
                }

                // Sắp xếp các luật gợi ý cho từng sản phẩm theo Hữu dụng thực tế (Utility) giảm dần
                foreach (var productId in rules.Keys.ToList())
                {
                    rules[productId] = rules[productId]
                        .OrderByDescending(r => r.Utility)
                        .ThenByDescending(r => r.Confidence)
                        .ToList();
                }

                // Lưu các luật vào Memory Cache trong vòng 24 giờ
                _cache.Set(CacheKey, rules, TimeSpan.FromHours(24));
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi huấn luyện mô hình HUI (Apriori Two-Phase): " + ex.Message);
            }
        }

        public async Task<IEnumerable<SanPham>> GetRecommendationsAsync(int productId, int limit = 4)
        {
            var recommendedProducts = new List<SanPham>();

            try
            {
                // 1. Thử lấy luật gợi ý từ Cache
                if (_cache.TryGetValue(CacheKey, out Dictionary<int, List<RecommendationRule>>? rules) && rules != null)
                {
                    if (rules.TryGetValue(productId, out var productRules))
                    {
                        var productIdsToFetch = productRules
                            .Select(r => r.RecommendedProductId)
                            .Take(limit)
                            .ToList();

                        if (productIdsToFetch.Any())
                        {
                            var fetched = await _context.SanPham
                                .Where(s => s.TrangThai && productIdsToFetch.Contains(s.SanPhamId))
                                .Include(s => s.DanhMuc)
                                .ToListAsync();

                            // Sắp xếp đúng theo thứ tự các luật kết hợp đã học
                            recommendedProducts = fetched
                                .OrderBy(s => productIdsToFetch.IndexOf(s.SanPhamId))
                                .ToList();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Lỗi khi lấy luật gợi ý Apriori từ Cache: " + ex.Message);
            }

            // 2. Dự phòng: Nếu không đủ sản phẩm gợi ý, lấy sản phẩm cùng Danh mục
            if (recommendedProducts.Count < limit)
            {
                try
                {
                    var currentProduct = await _context.SanPham
                        .Where(s => s.SanPhamId == productId)
                        .Select(s => new { s.DanhMucId })
                        .FirstOrDefaultAsync();

                    if (currentProduct != null)
                    {
                        int neededCount = limit - recommendedProducts.Count;
                        var excludeIds = recommendedProducts.Select(p => p.SanPhamId).Concat(new[] { productId }).ToList();

                        var similarProducts = await _context.SanPham
                            .Where(s => s.TrangThai && s.DanhMucId == currentProduct.DanhMucId && !excludeIds.Contains(s.SanPhamId))
                            .Include(s => s.DanhMuc)
                            .OrderByDescending(s => s.NgayTao)
                            .Take(neededCount)
                            .ToListAsync();

                        recommendedProducts.AddRange(similarProducts);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Lỗi dự phòng (cùng danh mục): " + ex.Message);
                }
            }

            // 3. Dự phòng cuối cùng: Lấy các sản phẩm mới nhất đang hoạt động
            if (recommendedProducts.Count < limit)
            {
                try
                {
                    int neededCount = limit - recommendedProducts.Count;
                    var excludeIds = recommendedProducts.Select(p => p.SanPhamId).Concat(new[] { productId }).ToList();

                    var popularProducts = await _context.SanPham
                        .Where(s => s.TrangThai && !excludeIds.Contains(s.SanPhamId))
                        .Include(s => s.DanhMuc)
                        .OrderByDescending(s => s.NgayTao)
                        .Take(neededCount)
                        .ToListAsync();

                    recommendedProducts.AddRange(popularProducts);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Lỗi dự phòng cuối cùng: " + ex.Message);
                }
            }

            return recommendedProducts.Take(limit);
        }
    }

    public class RecommendationRule
    {
        public int RecommendedProductId { get; set; }
        public double Confidence { get; set; }
        public double Support { get; set; }
        public double Utility { get; set; }
    }
}
