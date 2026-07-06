using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class VaiTroService : IVaiTroService
    {
        private readonly IUnitOfWork _unitOfWork;

        public VaiTroService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<VaiTro>> GetAllAsync()
        {
            return await _unitOfWork.VaiTro.GetAllAsync();
        }

        public async Task<VaiTro?> GetByIdAsync(int id)
        {
            return await _unitOfWork.VaiTro.GetByIdAsync(id);
        }

        public async Task<VaiTro?> GetByTenVaiTroAsync(string tenVaiTro)
        {
            return await _unitOfWork.VaiTro.GetByTenVaiTroAsync(tenVaiTro);
        }

        public async Task<VaiTro?> GetVaiTroWithNguoiDungsAsync(int vaiTroId)
        {
            return await _unitOfWork.VaiTro.GetVaiTroWithNguoiDungsAsync(vaiTroId);
        }

        public async Task<VaiTro> CreateAsync(VaiTro vaiTro)
        {
            await _unitOfWork.VaiTro.AddAsync(vaiTro);
            await _unitOfWork.SaveChangesAsync();
            return vaiTro;
        }

        public async Task<VaiTro?> UpdateAsync(int id, VaiTro vaiTro)
        {
            var existingVaiTro = await _unitOfWork.VaiTro.GetByIdAsync(id);
            if (existingVaiTro == null)
                return null;

            existingVaiTro.TenVaiTro = vaiTro.TenVaiTro;
            existingVaiTro.MoTa = vaiTro.MoTa;

            _unitOfWork.VaiTro.Update(existingVaiTro);
            await _unitOfWork.SaveChangesAsync();
            return existingVaiTro;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var vaiTro = await _unitOfWork.VaiTro.GetByIdAsync(id);
            if (vaiTro == null)
                return false;

            _unitOfWork.VaiTro.Remove(vaiTro);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
