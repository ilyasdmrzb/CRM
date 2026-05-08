using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context) => _context = context;

        public async Task<List<CustomerDto>> GetAllAsync(string? search = null)
        {
            var query = _context.Customers
                .Include(c => c.Creator)
                .Include(c => c.Contacts)
                .Include(c => c.Deals)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.CompanyName.Contains(search) ||
                    (c.City != null && c.City.Contains(search)) ||
                    (c.CariCode != null && c.CariCode.Contains(search)));

            return await query.OrderBy(c => c.CompanyName)
                .Select(c => MapToDto(c))
                .ToListAsync();
        }

        public async Task<CustomerDto?> GetByIdAsync(Guid id)
        {
            var c = await _context.Customers
                .Include(x => x.Creator)
                .Include(x => x.Contacts)
                .Include(x => x.Deals)
                .FirstOrDefaultAsync(x => x.Id == id);
            return c == null ? null : MapToDto(c);
        }

        public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto, Guid userId)
        {
            // Case-insensitive duplicate check
            var normalized = dto.CompanyName.Trim().ToLower();
            var exists = await _context.Customers
                .AnyAsync(c => c.CompanyName.ToLower() == normalized);

            if (exists) throw new InvalidOperationException($"'{dto.CompanyName}' şirketi zaten kayıtlı.");

            var customer = new Customer
            {
                CompanyName = dto.CompanyName.Trim(),
                CariCode = NormalizeOptional(dto.CariCode),
                TaxNumber = NormalizeOptional(dto.TaxNumber),
                City = NormalizeOptional(dto.City),
                Address = NormalizeOptional(dto.Address),
                CreatedBy = userId
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(customer.Id) ?? MapToDto(customer);
        }

        public async Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return null;

            // Check duplicate (excluding self)
            var normalized = dto.CompanyName.Trim().ToLower();
            var exists = await _context.Customers
                .AnyAsync(c => c.CompanyName.ToLower() == normalized && c.Id != id);
            if (exists) throw new InvalidOperationException($"'{dto.CompanyName}' şirketi zaten kayıtlı.");

            customer.CompanyName = dto.CompanyName.Trim();
            customer.CariCode = NormalizeOptional(dto.CariCode);
            customer.TaxNumber = NormalizeOptional(dto.TaxNumber);
            customer.City = NormalizeOptional(dto.City);
            customer.Address = NormalizeOptional(dto.Address);
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static CustomerDto MapToDto(Customer c) => new()
        {
            Id = c.Id,
            CompanyName = c.CompanyName,
            CariCode = c.CariCode,
            TaxNumber = c.TaxNumber,
            City = c.City,
            Address = c.Address,
            CreatedByName = c.Creator?.FullName ?? "",
            CreatedByShortName = c.Creator?.GetInitials() ?? "??",
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            ContactCount = c.Contacts?.Count ?? 0,
            DealCount = c.Deals?.Count ?? 0
        };
    }
}
