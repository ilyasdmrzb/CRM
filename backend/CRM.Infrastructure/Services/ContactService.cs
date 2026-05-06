using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class ContactService : IContactService
    {
        private readonly AppDbContext _context;
        public ContactService(AppDbContext context) => _context = context;

        public async Task<List<ContactDto>> GetByCustomerIdAsync(Guid customerId)
        {
            return await _context.Contacts
                .Include(c => c.Customer)
                .Where(c => c.CustomerId == customerId)
                .OrderByDescending(c => c.IsPrimary)
                .ThenBy(c => c.FullName)
                .Select(c => MapToDto(c))
                .ToListAsync();
        }

        public async Task<ContactDto?> GetByIdAsync(Guid id)
        {
            var c = await _context.Contacts.Include(x => x.Customer).FirstOrDefaultAsync(x => x.Id == id);
            return c == null ? null : MapToDto(c);
        }

        public async Task<ContactDto> CreateAsync(CreateContactDto dto)
        {
            var contact = new Contact
            {
                CustomerId = dto.CustomerId,
                FullName = dto.FullName,
                Title = dto.Title,
                Phone = dto.Phone,
                Email = dto.Email,
                IsPrimary = dto.IsPrimary
            };
            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(contact.Id) ?? MapToDto(contact);
        }

        public async Task<ContactDto?> UpdateAsync(Guid id, UpdateContactDto dto)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null) return null;
            contact.FullName = dto.FullName;
            contact.Title = dto.Title;
            contact.Phone = dto.Phone;
            contact.Email = dto.Email;
            contact.IsPrimary = dto.IsPrimary;
            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var contact = await _context.Contacts.FindAsync(id);
            if (contact == null) return false;
            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync();
            return true;
        }

        private static ContactDto MapToDto(Contact c) => new()
        {
            Id = c.Id,
            CustomerId = c.CustomerId,
            CustomerName = c.Customer?.CompanyName ?? "",
            FullName = c.FullName,
            Title = c.Title,
            Phone = c.Phone,
            Email = c.Email,
            IsPrimary = c.IsPrimary,
            CreatedAt = c.CreatedAt
        };
    }
}
