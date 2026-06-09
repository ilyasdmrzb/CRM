using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class LossReasonOptionService : ILossReasonOptionService
    {
        private readonly AppDbContext _context;

        public LossReasonOptionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<LossReasonOptionDto>> GetAllAsync(bool includeInactive = false)
        {
            var query = _context.LossReasonOptions.AsQueryable();

            if (!includeInactive)
                query = query.Where(x => x.IsActive);

            return await query
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.Name)
                .Select(x => MapToDto(x))
                .ToListAsync();
        }

        public async Task<LossReasonOptionDto> CreateAsync(CreateLossReasonOptionDto dto)
        {
            var name = NormalizeName(dto.Name);
            await EnsureUniqueNameAsync(name);

            var option = new LossReasonOption
            {
                Name = name,
                SortOrder = dto.SortOrder,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.LossReasonOptions.Add(option);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("Bu kaybetme nedeni zaten mevcut.");
            }

            return MapToDto(option);
        }

        public async Task<LossReasonOptionDto?> UpdateAsync(int id, UpdateLossReasonOptionDto dto)
        {
            var option = await _context.LossReasonOptions.FindAsync(id);
            if (option == null) return null;

            var name = NormalizeName(dto.Name);
            await EnsureUniqueNameAsync(name, id);

            option.Name = name;
            option.SortOrder = dto.SortOrder;
            option.IsActive = dto.IsActive;
            option.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("Bu kaybetme nedeni zaten mevcut.");
            }

            return MapToDto(option);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var option = await _context.LossReasonOptions.FindAsync(id);
            if (option == null) return false;

            _context.LossReasonOptions.Remove(option);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task EnsureUniqueNameAsync(string name, int? exceptId = null)
        {
            var normalizedName = name.ToLower();
            var exists = await _context.LossReasonOptions
                .AnyAsync(x => x.Name.ToLower() == normalizedName && (!exceptId.HasValue || x.Id != exceptId.Value));

            if (exists)
                throw new InvalidOperationException("Bu kaybetme nedeni zaten mevcut.");
        }

        private static string NormalizeName(string name)
        {
            var normalized = string.Join(" ", name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
            if (string.IsNullOrWhiteSpace(normalized))
                throw new InvalidOperationException("Kaybetme nedeni boş olamaz.");

            return normalized;
        }

        private static LossReasonOptionDto MapToDto(LossReasonOption option) => new()
        {
            Id = option.Id,
            Name = option.Name,
            SortOrder = option.SortOrder,
            IsActive = option.IsActive
        };
    }
}
