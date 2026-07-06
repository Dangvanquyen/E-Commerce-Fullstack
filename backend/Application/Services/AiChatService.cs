using Application.Services.Interfaces;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using Application.DTOs.Responses;

namespace Application.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ISanPhamService _sanPhamService;
        private readonly IDanhMucService _danhMucService;

        // Cache context 5 phút để tránh query DB quá nhiều
        private static string? _cachedContext = null;
        private static DateTime _cacheExpiry = DateTime.MinValue;
        private static readonly SemaphoreSlim _cacheLock = new SemaphoreSlim(1, 1);

        private const string BaseSystemPrompt = @"Bạn là trợ lý AI thân thiện của cửa hàng thời trang **FashionStore**.
Nhiệm vụ của bạn là tư vấn mua sắm chuyên nghiệp dựa CHÍNH XÁC vào danh sách sản phẩm, danh mục, sản phẩm bán chạy, sản phẩm mới và dữ liệu THỰC TẾ dưới đây.

CHÍNH SÁCH CỬA HÀNG:
- Đổi trả: Trong vòng 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả, còn nguyên tem nhãn
- Giao hàng: Toàn quốc, miễn phí với đơn hàng trên 500.000đ, 2-5 ngày làm việc
- Thanh toán: COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng, VNPay
- Bảo hành: Cam kết hàng chính hãng, chất lượng cao

HƯỚNG DẪN SIZE (chung):
- Size S: Dưới 50kg, chiều cao 155-160cm
- Size M: 50-60kg, chiều cao 160-165cm  
- Size L: 60-70kg, chiều cao 165-170cm
- Size XL: 70-80kg, chiều cao 170-175cm
- Size XXL: Trên 80kg, chiều cao trên 175cm

QUY TẮC TƯ VẤN BÁN HÀNG:
1. LUÔN dùng tiếng Việt, xưng hô thân mật (ví dụ: Dạ chào bạn, shop có thể giúp gì cho bạn...), lịch sự, nhiệt tình.
2. Tư vấn sản phẩm Bán chạy nhất: Khi khách hỏi về sản phẩm bán chạy, hot nhất, được mua nhiều nhất -> giới thiệu từ danh sách ""SẢN PHẨM BÁN CHẠY NHẤT"" bên dưới. Nêu rõ lý do (ví dụ: số lượng sản phẩm bán ra cực lớn, được khách hàng ưa chuộng).
3. Tư vấn sản phẩm Mới nhất: Khi khách hỏi về sản phẩm mới, hàng mới về, mẫu mới -> giới thiệu từ danh sách ""SẢN PHẨM MỚI NHẤT"". Nhấn mạnh đây là các mẫu thiết kế mới nhất của shop vừa cập nhật.
4. Tư vấn sản phẩm Hot/Xem nhiều: Khi khách hỏi về sản phẩm được quan tâm, hot trend, được xem nhiều -> giới thiệu từ danh sách ""SẢN PHẨM ĐƯỢC QUAN TÂM/XEM NHIỀU NHẤT"".
5. Tư vấn mix đồ / phối trang phục: Chủ động gợi ý phối các sản phẩm với nhau (ví dụ: áo thun phối cùng quần short hoặc quần jeans của shop) để nâng cao doanh số bán hàng.
6. Tra cứu chi tiết sản phẩm: Khi khách hỏi về sản phẩm cụ thể, tra cứu giá bán, màu sắc, size có sẵn từ danh sách sản phẩm theo danh mục. Nếu hết hàng, khéo léo giới thiệu sản phẩm khác cùng loại còn hàng.
7. Tư vấn chọn size: Hỏi chiều cao, cân nặng của khách để tư vấn chính xác size (S, M, L, XL, XXL) theo bảng Hướng dẫn chọn size ở trên.
8. Câu trả lời rõ ràng, có cấu trúc (sử dụng gạch đầu dòng cho danh sách sản phẩm để dễ nhìn), có tính thuyết phục cao và ngắn gọn (dưới 350 từ).
9. Luôn có câu chào kết lịch sự và hỏi xem khách có cần hỗ trợ gì khác không.

";

        private readonly IThongKeService _thongKeService;

        public AiChatService(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ISanPhamService sanPhamService,
            IDanhMucService danhMucService,
            IThongKeService thongKeService)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _sanPhamService = sanPhamService;
            _danhMucService = danhMucService;
            _thongKeService = thongKeService;
        }

        /// <summary>
        /// Xây dựng context thực tế từ DB: danh mục + sản phẩm + variants + thống kê bán chạy/mới
        /// Có cache 5 phút để tránh query quá nhiều
        /// </summary>
        public async Task<string> BuildStoreContextAsync()
        {
            // Check cache
            if (_cachedContext != null && DateTime.Now < _cacheExpiry)
            {
                return _cachedContext;
            }

            await _cacheLock.WaitAsync();
            try
            {
                // Double-check after lock
                if (_cachedContext != null && DateTime.Now < _cacheExpiry)
                    return _cachedContext;

                var sb = new StringBuilder();
                sb.AppendLine("=== DỮ LIỆU THỰC TẾ CỦA CỬA HÀNG ===");

                // 1. Lấy danh mục
                var danhMucs = (await _danhMucService.GetActiveDanhMucsAsync()).ToList();
                sb.AppendLine($"\nDANH MỤC SẢN PHẨM ({danhMucs.Count} danh mục):");
                foreach (var dm in danhMucs)
                {
                    sb.AppendLine($"  - {dm.TenDanhMuc}: {dm.MoTa}");
                }

                // 2. Lấy tất cả sản phẩm active
                var sanPhams = (await _sanPhamService.GetActiveSanPhamsAsync()).ToList();

                // 3. Lấy Top sản phẩm bán chạy nhất
                List<DoanhThuSanPhamResponse> bestSellers = new();
                try
                {
                    bestSellers = (await _thongKeService.GetDoanhThuTheoSanPhamAsync(null, null, 10)).ToList();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"AiChatService - Error fetching best sellers: {ex.Message}");
                }

                sb.AppendLine($"\nSẢN PHẨM BÁN CHẠY NHẤT (dựa trên số lượng đã bán thực tế):");
                if (bestSellers.Any())
                {
                    foreach (var bs in bestSellers)
                    {
                        sb.AppendLine($"  - {bs.TenSanPham} (ID: {bs.SanPhamId}) - Đã bán: {bs.SoLuongBan} sản phẩm");
                    }
                }
                else
                {
                    // Dự phòng nếu DB trống: lấy 3 sản phẩm đầu tiên
                    var backupBest = sanPhams.Take(3).ToList();
                    foreach (var sp in backupBest)
                    {
                        sb.AppendLine($"  - {sp.TenSanPham} (ID: {sp.SanPhamId}) - Đang rất hot tại shop");
                    }
                }

                // 4. Lấy sản phẩm mới nhất
                var newProducts = sanPhams.OrderByDescending(sp => sp.NgayTao).Take(5).ToList();
                sb.AppendLine($"\nSẢN PHẨM MỚI NHẤT (hàng mới về):");
                foreach (var sp in newProducts)
                {
                    sb.AppendLine($"  - {sp.TenSanPham} (ID: {sp.SanPhamId}) - Giá: {sp.Gia:N0}đ (Vừa cập nhật ngày: {sp.NgayTao:dd/MM/yyyy})");
                }

                // 5. Lấy Top sản phẩm được xem nhiều nhất
                List<ThongKeClickSanPhamResponse> topClicks = new();
                try
                {
                    topClicks = (await _thongKeService.GetTopClickSanPhamAsync(null, null, 10)).ToList();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"AiChatService - Error fetching top clicks: {ex.Message}");
                }

                sb.AppendLine($"\nSẢN PHẨM ĐƯỢC QUAN TÂM/XEM NHIỀU NHẤT:");
                if (topClicks.Any())
                {
                    foreach (var tc in topClicks)
                    {
                        sb.AppendLine($"  - {tc.TenSanPham} (ID: {tc.SanPhamId}) - Số lượt xem: {tc.SoLuotClick} - Thời gian xem TB: {tc.ThoiGianXemTBPhut} phút");
                    }
                }
                else
                {
                    // Dự phòng nếu chưa có click: lấy 3 sản phẩm tiếp theo
                    var backupClicks = sanPhams.Skip(3).Take(3).ToList();
                    foreach (var sp in backupClicks)
                    {
                        sb.AppendLine($"  - {sp.TenSanPham} (ID: {sp.SanPhamId}) - Được nhiều khách hàng quan tâm");
                    }
                }

                // Nhóm theo danh mục để liệt kê kho hàng chi tiết
                var sanPhamByDm = sanPhams.GroupBy(sp => sp.DanhMucId).ToDictionary(g => g.Key, g => g.ToList());

                sb.AppendLine($"\nCHI TIẾT SỐ LƯỢNG TỒN VÀ SIZE/MÀU TỪNG SẢN PHẨM:");

                foreach (var dm in danhMucs)
                {
                    if (!sanPhamByDm.TryGetValue(dm.DanhMucId, out var spList) || spList.Count == 0)
                        continue;

                    sb.AppendLine($"\n[{dm.TenDanhMuc.ToUpper()}]");
                    foreach (var sp in spList)
                    {
                        sb.AppendLine($"  • {sp.TenSanPham} (ID: {sp.SanPhamId})");
                        sb.AppendLine($"    Giá gốc: {sp.Gia:N0}đ");
                        if (!string.IsNullOrWhiteSpace(sp.MoTa))
                            sb.AppendLine($"    Mô tả: {sp.MoTa}");

                        // Lấy chi tiết variants (size, màu, tồn kho)
                        if (sp.SanPhamChiTiets != null && sp.SanPhamChiTiets.Any())
                        {
                            var variants = sp.SanPhamChiTiets.ToList();
                            var sizes = variants.Select(v => v.Size).Distinct().OrderBy(s => s).ToList();
                            var colors = variants.Select(v => v.MauSac).Distinct().ToList();
                            var totalStock = variants.Sum(v => v.SoLuongTon);

                            sb.AppendLine($"    Sizes có sẵn: {string.Join(", ", sizes)}");
                            sb.AppendLine($"    Màu sắc: {string.Join(", ", colors)}");
                            sb.AppendLine($"    Tổng tồn kho: {totalStock} sản phẩm");

                            // Liệt kê variant còn hàng
                            var inStock = variants.Where(v => v.SoLuongTon > 0).ToList();
                            if (inStock.Count < variants.Count)
                            {
                                var outOfStock = variants.Where(v => v.SoLuongTon == 0)
                                    .Select(v => $"{v.Size}/{v.MauSac}").ToList();
                                if (outOfStock.Any())
                                    sb.AppendLine($"    HẾT HÀNG: {string.Join(", ", outOfStock)}");
                            }

                            // Giá variant nếu khác giá gốc
                            var variantPrices = variants.Where(v => v.GiaBan > 0 && v.GiaBan != sp.Gia)
                                .GroupBy(v => v.GiaBan)
                                .Select(g => $"{g.Key:N0}đ ({string.Join(", ", g.Select(v => $"{v.Size}/{v.MauSac}"))})");
                            if (variantPrices.Any())
                                sb.AppendLine($"    Giá theo variant: {string.Join(" | ", variantPrices)}");
                        }
                        else
                        {
                            sb.AppendLine($"    (Chưa có thông tin size/màu chi tiết)");
                        }
                    }
                }

                sb.AppendLine("\n=== HẾT DỮ LIỆU CỬA HÀNG ===");

                _cachedContext = sb.ToString();
                _cacheExpiry = DateTime.Now.AddMinutes(5);
                return _cachedContext;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AiChatService - BuildStoreContext error: {ex.Message}");
                return "=== Không thể tải dữ liệu sản phẩm, vui lòng trả lời theo thông tin chung ===";
            }
            finally
            {
                _cacheLock.Release();
            }
        }

        public async Task<AiChatResponse> SendMessageAsync(AiChatRequest request)
        {
            try
            {
                var apiKey = _configuration["GeminiAI:ApiKey"];
                var modelName = _configuration["GeminiAI:ModelName"] ?? "gemini-2.0-flash";
                var baseUrl = _configuration["GeminiAI:BaseUrl"] ?? "https://generativelanguage.googleapis.com/v1beta/models";

                if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_GEMINI_API_KEY_HERE")
                {
                    return await GetLocalFallbackResponseAsync(request);
                }

                // Lấy context thực tế từ DB
                var storeContext = await BuildStoreContextAsync();
                var fullSystemPrompt = BaseSystemPrompt + storeContext;

                var client = _httpClientFactory.CreateClient("GeminiAI");

                // Build conversation với system prompt được nhúng vào cặp user/model đầu
                var contents = new List<object>
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = fullSystemPrompt + "\n\nHãy xác nhận bạn đã sẵn sàng tư vấn." } }
                    },
                    new
                    {
                        role = "model",
                        parts = new[] { new { text = "Tôi đã sẵn sàng! Tôi là trợ lý AI của FashionStore và đã nắm đầy đủ thông tin về toàn bộ sản phẩm, giá cả, size, màu sắc, tồn kho và chính sách cửa hàng. Hãy hỏi tôi bất cứ điều gì!" } }
                    }
                };

                // Thêm lịch sử hội thoại
                foreach (var msg in request.History)
                {
                    contents.Add(new
                    {
                        role = msg.Role,
                        parts = new[] { new { text = msg.Content } }
                    });
                }

                // Tin nhắn hiện tại
                contents.Add(new
                {
                    role = "user",
                    parts = new[] { new { text = request.Message } }
                });

                var payload = new
                {
                    contents,
                    generationConfig = new
                    {
                        temperature = 0.5,
                        topK = 40,
                        topP = 0.95,
                        maxOutputTokens = 600
                    }
                };

                var url = $"{baseUrl}/{modelName}:generateContent?key={apiKey}";
                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(payload),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await client.PostAsync(url, jsonContent);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"AiChatService - Gemini API error: {response.StatusCode} - {responseBody}");
                    // Cải tiến: Khi API lỗi, tự động chuyển sang fallback trả lời tự động bằng dữ liệu local thay vì báo lỗi
                    return await GetLocalFallbackResponseAsync(request);
                }

                using var doc = JsonDocument.Parse(responseBody);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return new AiChatResponse
                {
                    Success = true,
                    Reply = text ?? "Xin lỗi, tôi không hiểu câu hỏi. Bạn có thể hỏi lại không? 😊"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AiChatService - Exception: {ex.Message}");
                // Cải tiến: Khi có lỗi kết nối, tự động chuyển sang fallback trả lời tự động bằng dữ liệu local
                return await GetLocalFallbackResponseAsync(request);
            }
        }

        /// <summary>
        /// Phản hồi dự phòng cục bộ khi API Gemini lỗi (ví dụ: Quota Exceeded)
        /// Sử dụng so khớp từ khóa và truy xuất DB thực tế để đảm bảo luôn trả lời thông minh.
        /// </summary>
        public async Task<AiChatResponse> GetLocalFallbackResponseAsync(AiChatRequest request)
        {
            var userMsg = request.Message.Trim().ToLower();
            var reply = new StringBuilder();

            try
            {
                var sanPhams = (await _sanPhamService.GetActiveSanPhamsAsync()).ToList();
                var danhMucs = (await _danhMucService.GetActiveDanhMucsAsync()).ToList();

                // 1. Chào hỏi
                if (userMsg.Contains("xin chào") || userMsg.Contains("chào shop") || userMsg.Contains("chào bạn") || userMsg.Contains("hello") || userMsg.Contains("hi"))
                {
                    return new AiChatResponse
                    {
                        Success = true,
                        Reply = "Dạ, **FashionStore** xin chào bạn! 👋 Mình là trợ lý tự động tư vấn bán hàng của shop.\n\nBạn cần mình hỗ trợ gì ạ? Shop đang có các mẫu **sản phẩm mới**, danh sách **bán chạy nhất**, tư vấn chọn **size**, chính sách **đổi trả/vận chuyển**... Bạn cứ hỏi thoải mái nhé! 😊"
                    };
                }

                // 2. Sản phẩm bán chạy
                if (userMsg.Contains("bán chạy") || userMsg.Contains("hot nhất") || userMsg.Contains("mua nhiều") || userMsg.Contains("phổ biến"))
                {
                    List<DoanhThuSanPhamResponse> bestSellers = new();
                    try
                    {
                        bestSellers = (await _thongKeService.GetDoanhThuTheoSanPhamAsync(null, null, 5)).ToList();
                    }
                    catch { }

                    reply.AppendLine("Dạ, đây là các sản phẩm **bán chạy nhất** được khách hàng yêu thích và mua nhiều nhất tại **FashionStore** thời gian qua:\n");
                    if (bestSellers.Any())
                    {
                        foreach (var bs in bestSellers)
                        {
                            var fullSp = sanPhams.FirstOrDefault(x => x.SanPhamId == bs.SanPhamId);
                            var priceStr = fullSp != null ? $"{fullSp.Gia:N0}đ" : "Liên hệ shop";
                            reply.AppendLine($"⭐ **{bs.TenSanPham}** - Giá: `{priceStr}` (Đã bán: **{bs.SoLuongBan}** sản phẩm)");
                        }
                    }
                    else
                    {
                        var backupBest = sanPhams.Take(3).ToList();
                        foreach (var sp in backupBest)
                        {
                            reply.AppendLine($"🔥 **{sp.TenSanPham}** - Giá: `{sp.Gia:N0}đ` (Đang rất hot tại shop)");
                        }
                    }
                    reply.AppendLine("\nBạn có muốn shop tư vấn chi tiết hơn về sản phẩm nào trong số này không ạ? 😊");
                    return new AiChatResponse { Success = true, Reply = reply.ToString() };
                }

                // 3. Sản phẩm mới
                if (userMsg.Contains("mới") || userMsg.Contains("new") || userMsg.Contains("mẫu mới") || userMsg.Contains("mới về") || userMsg.Contains("hàng mới"))
                {
                    var newProducts = sanPhams.OrderByDescending(sp => sp.NgayTao).Take(5).ToList();
                    reply.AppendLine("Dạ, **FashionStore** vừa cập nhật các mẫu **sản phẩm mới nhất** cực kỳ thời thượng, bạn xem qua nhé:\n");
                    if (newProducts.Any())
                    {
                        foreach (var sp in newProducts)
                        {
                            reply.AppendLine($"✨ **{sp.TenSanPham}** - Giá: `{sp.Gia:N0}đ` (Ngày cập nhật: {sp.NgayTao:dd/MM/yyyy})");
                        }
                    }
                    else
                    {
                        reply.AppendLine("Hiện shop đang chuẩn bị cập nhật thêm nhiều bộ sưu tập mới. Bạn vui lòng quay lại sau nha!");
                    }
                    reply.AppendLine("\nBạn cần shop tư vấn chất liệu hay chọn size cho các mẫu mới này không ạ? 😊");
                    return new AiChatResponse { Success = true, Reply = reply.ToString() };
                }

                // 4. Tư vấn size
                if (userMsg.Contains("size") || userMsg.Contains("kích cỡ") || userMsg.Contains("cân nặng") || userMsg.Contains("chiều cao") || userMsg.Contains("mặc vừa") || userMsg.Contains("nặng") || userMsg.Contains("cao"))
                {
                    return new AiChatResponse
                    {
                        Success = true,
                        Reply = "Dạ, để mặc thoải mái và tôn dáng nhất, bạn tham khảo bảng **hướng dẫn chọn size** chuẩn của shop nha:\n\n" +
                                "- **Size S**: Dưới 50kg, cao 155-160cm\n" +
                                "- **Size M**: 50-60kg, cao 160-165cm\n" +
                                "- **Size L**: 60-70kg, cao 165-170cm\n" +
                                "- **Size XL**: 70-80kg, cao 170-175cm\n" +
                                "- **Size XXL**: Trên 80kg, cao trên 175cm\n\n" +
                                "👉 Bạn có thể chia sẻ **chiều cao và cân nặng** cụ thể của mình để shop tư vấn trực tiếp size phù hợp nhất cho bạn nhé! 😊"
                    };
                }

                // 5. Đổi trả / chính sách
                if (userMsg.Contains("đổi trả") || userMsg.Contains("hoàn tiền") || userMsg.Contains("bảo hành") || userMsg.Contains("lỗi"))
                {
                    return new AiChatResponse
                    {
                        Success = true,
                        Reply = "Dạ, về **chính sách đổi trả** tại **FashionStore**, shop cam kết hỗ trợ tối đa cho bạn:\n\n" +
                                "✅ **Thời gian**: Đổi trả trong vòng **7 ngày** kể từ ngày nhận hàng thành công.\n" +
                                "✅ **Điều kiện**: Sản phẩm bị lỗi nhà sản xuất, giao sai màu/size hoặc không đúng mô tả. Yêu cầu sản phẩm còn nguyên tem nhãn, chưa qua sử dụng hay giặt là.\n" +
                                "✅ **Chi phí**: Shop hỗ trợ phí ship đổi trả 2 chiều nếu phát sinh lỗi từ phía shop.\n\n" +
                                "Bạn cần hỗ trợ đổi trả đơn hàng nào cụ thể không ạ? Shop sẽ hỗ trợ bạn ngay! 😊"
                    };
                }

                // 6. Vận chuyển / phí ship
                if (userMsg.Contains("vận chuyển") || userMsg.Contains("giao hàng") || userMsg.Contains("ship") || userMsg.Contains("phí ship") || userMsg.Contains("bao lâu"))
                {
                    return new AiChatResponse
                    {
                        Success = true,
                        Reply = "Dạ, chính sách **giao nhận hàng** tại **FashionStore** như sau:\n\n" +
                                "🚚 **Thời gian giao hàng**: \n" +
                                "- Khu vực nội thành: 1-2 ngày làm việc.\n" +
                                "- Các tỉnh thành khác: 2-5 ngày làm việc.\n" +
                                "💸 **Phí ship**: Đồng giá ship toàn quốc là 30.000đ. Đặc biệt, shop **MIỄN PHÍ SHIP** cho mọi đơn hàng có giá trị từ **500.000đ** trở lên ạ! Đông Nam Á."
                    };
                }

                // 7. Thanh toán
                if (userMsg.Contains("thanh toán") || userMsg.Contains("bank") || userMsg.Contains("chuyển khoản") || userMsg.Contains("vnpay") || userMsg.Contains("tiền mặt") || userMsg.Contains("cod"))
                {
                    return new AiChatResponse
                    {
                        Success = true,
                        Reply = "Dạ, để thuận tiện cho việc mua sắm, shop hỗ trợ các **phương thức thanh toán** sau:\n\n" +
                                "1. **COD**: Nhận hàng và thanh toán tiền mặt trực tiếp cho shipper.\n" +
                                "2. **Chuyển khoản ngân hàng**: Chuyển khoản trực tiếp qua số tài khoản của shop.\n" +
                                "3. **Cổng thanh toán VNPay**: Quét mã QR thanh toán nhanh và an toàn trực tuyến.\n\n" +
                                "Bạn muốn lựa chọn thanh toán theo hình thức nào khi mua hàng ạ? 😊"
                    };
                }

                // 8. So khớp danh mục sản phẩm (ví dụ: áo, quần, đầm, phụ kiện)
                var matchedDm = danhMucs.FirstOrDefault(dm => userMsg.Contains(dm.TenDanhMuc.ToLower()));
                if (matchedDm != null)
                {
                    var filteredSps = sanPhams.Where(sp => sp.DanhMucId == matchedDm.DanhMucId).Take(5).ToList();
                    reply.AppendLine($"Dạ, hiện tại **FashionStore** đang có các mẫu **{matchedDm.TenDanhMuc}** rất được ưa chuộng sau đây:\n");
                    if (filteredSps.Any())
                    {
                        foreach (var sp in filteredSps)
                        {
                            reply.AppendLine($"🛍️ **{sp.TenSanPham}** - Giá: `{sp.Gia:N0}đ`{(sp.MoTa != null ? $" ({sp.MoTa})" : "")}");
                        }
                        reply.AppendLine($"\nBạn có muốn shop gửi ảnh chi tiết hoặc tư vấn size cho mẫu **{matchedDm.TenDanhMuc}** nào không ạ? 😊");
                    }
                    else
                    {
                        reply.AppendLine($"Hiện tại các mẫu {matchedDm.TenDanhMuc} đang tạm hết hàng hoặc đang cập nhật thêm. Bạn tham khảo danh mục khác nhé!");
                    }
                    return new AiChatResponse { Success = true, Reply = reply.ToString() };
                }

                // 9. So khớp tên sản phẩm cụ thể
                var matchedSp = sanPhams.FirstOrDefault(sp => userMsg.Contains(sp.TenSanPham.ToLower()));
                if (matchedSp != null)
                {
                    reply.AppendLine($"Dạ, sản phẩm **{matchedSp.TenSanPham}** có thông tin chi tiết như sau ạ:\n");
                    reply.AppendLine($"💰 **Giá bán**: `{matchedSp.Gia:N0}đ`");
                    if (!string.IsNullOrEmpty(matchedSp.MoTa))
                    {
                        reply.AppendLine($"📝 **Mô tả**: {matchedSp.MoTa}");
                    }

                    if (matchedSp.SanPhamChiTiets != null && matchedSp.SanPhamChiTiets.Any())
                    {
                        var variants = matchedSp.SanPhamChiTiets.ToList();
                        var sizes = variants.Select(v => v.Size).Distinct().OrderBy(s => s).ToList();
                        var colors = variants.Select(v => v.MauSac).Distinct().ToList();
                        var stock = variants.Sum(v => v.SoLuongTon);

                        reply.AppendLine($"📏 **Sizes có sẵn**: {string.Join(", ", sizes)}");
                        reply.AppendLine($"🎨 **Màu sắc**: {string.Join(", ", colors)}");
                        reply.AppendLine($"📦 **Trạng thái**: {(stock > 0 ? "Còn hàng" : "Hết hàng")}");
                    }
                    reply.AppendLine("\nBạn có muốn đặt mua sản phẩm này hoặc cần shop tư vấn thêm chọn size không ạ? 😊");
                    return new AiChatResponse { Success = true, Reply = reply.ToString() };
                }

                // 10. Fallback chung (nếu không khớp từ khóa nào)
                var featured = sanPhams.Take(3).ToList();
                reply.AppendLine("Dạ, hiện tại bộ phận kết nối AI của shop đang quá tải. Mình xin giới thiệu đến bạn top sản phẩm nổi bật của **FashionStore** nha:\n");
                foreach (var sp in featured)
                {
                    reply.AppendLine($"✨ **{sp.TenSanPham}** - Giá: `{sp.Gia:N0}đ`");
                }
                reply.AppendLine("\nBạn có thể hỏi các từ khóa như: *bán chạy, sản phẩm mới, chọn size, ship hàng* hoặc click nút **Chat trực tiếp** ở góc màn hình để gặp nhân viên hỗ trợ ngay nhé! Shop cảm ơn bạn nhiều! ❤️");

                return new AiChatResponse
                {
                    Success = true,
                    Reply = reply.ToString()
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AiChatService - Fallback Exception: {ex.Message}");
                return new AiChatResponse
                {
                    Success = true,
                    Reply = "Dạ, FashionStore xin chào bạn! 👋 Rất xin lỗi bạn vì hệ thống kết nối AI đang quá tải. Bạn cần shop hỗ trợ thông tin gì ạ? Bạn có thể hỏi về các sản phẩm **bán chạy nhất**, **mẫu mới về** hoặc click chọn chat trực tiếp để gặp nhân viên hỗ trợ ngay nhé! 😊"
                };
            }
        }

        /// <summary>
        /// Xóa cache khi có sản phẩm mới được thêm/sửa/xóa
        /// </summary>
        public static void InvalidateCache()
        {
            _cachedContext = null;
            _cacheExpiry = DateTime.MinValue;
        }
    }
}
