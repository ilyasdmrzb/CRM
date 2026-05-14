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
            var normalized = NormalizeForDuplicateCheck(dto.CompanyName);
            var exists = await _context.Customers
                .AnyAsync(c => c.CompanyName.Replace(" ", "").ToUpper() == normalized);

            if (exists) throw new InvalidOperationException($"'{dto.CompanyName}' (veya benzeri) zaten kayıtlı.");

            var responsibleUserId = dto.ResponsibleUserId ?? userId;
            var customer = new Customer
            {
                CompanyName = dto.CompanyName.Trim(),
                CariCode = NormalizeOptional(dto.CariCode),
                TaxNumber = NormalizeOptional(dto.TaxNumber),
                City = NormalizeOptional(dto.City),
                Sector = NormalizeOptional(dto.Sector),
                Address = NormalizeOptional(dto.Address),
                CreatedBy = responsibleUserId
            };
            _context.Customers.Add(customer);

            if (!string.IsNullOrWhiteSpace(dto.ContactName) || !string.IsNullOrWhiteSpace(dto.Email) || !string.IsNullOrWhiteSpace(dto.Phone))
            {
                var contact = new Contact
                {
                    CustomerId = customer.Id,
                    FullName = dto.ContactName ?? "İsimsiz Yetkili",
                    Title = dto.ContactTitle,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    IsPrimary = true
                };
                _context.Contacts.Add(contact);
            }

            await _context.SaveChangesAsync();

            return await GetByIdAsync(customer.Id) ?? MapToDto(customer);
        }

        public async Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return null;

            var normalized = NormalizeForDuplicateCheck(dto.CompanyName);
            var exists = await _context.Customers
                .AnyAsync(c => c.CompanyName.Replace(" ", "").ToUpper() == normalized && c.Id != id);
            
            if (exists) throw new InvalidOperationException($"'{dto.CompanyName}' (veya benzeri) zaten kayıtlı.");

            customer.CompanyName = dto.CompanyName.Trim();
            customer.CariCode = NormalizeOptional(dto.CariCode);
            customer.TaxNumber = NormalizeOptional(dto.TaxNumber);
            customer.City = NormalizeOptional(dto.City);
            customer.Sector = NormalizeOptional(dto.Sector);
            customer.Address = NormalizeOptional(dto.Address);
            if (dto.ResponsibleUserId.HasValue) customer.CreatedBy = dto.ResponsibleUserId.Value;
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Birincil iletişim kişisini bul veya oluştur
            var primaryContact = await _context.Contacts.FirstOrDefaultAsync(ct => ct.CustomerId == id && ct.IsPrimary);
            if (primaryContact != null)
            {
                primaryContact.FullName = dto.ContactName ?? primaryContact.FullName;
                primaryContact.Title = dto.ContactTitle;
                primaryContact.Email = dto.Email;
                primaryContact.Phone = dto.Phone;
            }
            else if (!string.IsNullOrWhiteSpace(dto.ContactName) || !string.IsNullOrWhiteSpace(dto.Email) || !string.IsNullOrWhiteSpace(dto.Phone))
            {
                var contact = new Contact
                {
                    CustomerId = id,
                    FullName = dto.ContactName ?? "İsimsiz Yetkili",
                    Title = dto.ContactTitle,
                    Email = dto.Email,
                    Phone = dto.Phone,
                    IsPrimary = true
                };
                _context.Contacts.Add(contact);
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            try
            {
                _context.Customers.Remove(customer);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("Bu müşteriye bağlı anlaşmalar veya iletişim kişileri olduğu için silinemez. Lütfen önce bağlı kayıtları silin.");
            }
        }

        private static string? NormalizeOptional(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        }

        private static string NormalizeForDuplicateCheck(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) return string.Empty;
            // Boşlukları temizle, büyük harfe çevir (Türkçe karakter duyarlılığı için ToUpper kullanılabilir ama SQL tarafında collation önemli)
            // C# tarafında InMemory veya Client-side evaluation için:
            return name.Replace(" ", "").ToUpperInvariant();
        }

        private static CustomerDto MapToDto(Customer c) => new()
        {
            Id = c.Id,
            CompanyName = c.CompanyName,
            CariCode = c.CariCode,
            TaxNumber = c.TaxNumber,
            City = c.City,
            Sector = c.Sector,
            Address = c.Address,
            CreatedByName = c.Creator?.FullName ?? "",
            CreatedByShortName = c.Creator?.GetInitials() ?? "??",
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            ContactCount = c.Contacts?.Count ?? 0,
            DealCount = c.Deals?.Count ?? 0,
            PrimaryContactName = c.Contacts?.FirstOrDefault(ct => ct.IsPrimary)?.FullName,
            PrimaryContactTitle = c.Contacts?.FirstOrDefault(ct => ct.IsPrimary)?.Title,
            PrimaryContactEmail = c.Contacts?.FirstOrDefault(ct => ct.IsPrimary)?.Email,
            PrimaryContactPhone = c.Contacts?.FirstOrDefault(ct => ct.IsPrimary)?.Phone
        };
    }
}

