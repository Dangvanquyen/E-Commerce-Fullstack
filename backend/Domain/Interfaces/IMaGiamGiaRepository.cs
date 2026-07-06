using Domain.Entities;
using System.Threading.Tasks;

namespace Domain.Interfaces
{
    public interface IMaGiamGiaRepository : IGenericRepository<MaGiamGia>
    {
        Task<MaGiamGia?> GetByCodeAsync(string code);
    }
}
