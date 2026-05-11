using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class ActivityService : IActivityService
    {
        private readonly AppDbContext _context;
        public ActivityService(AppDbContext context) => _context = context;

        public async Task<List<ActivityDto>> GetAllAsync(Guid? customerId = null, Guid? dealId = null, string? type = null)
        {
            var query = _context.Activities
                .Include(a => a.Customer).Include(a => a.Deal).Include(a => a.User)
                .AsQueryable();

            if (customerId.HasValue) query = query.Where(a => a.CustomerId == customerId);
            if (dealId.HasValue) query = query.Where(a => a.DealId == dealId);
            if (!string.IsNullOrWhiteSpace(type)) query = query.Where(a => a.ActivityType == type);

            return await query.OrderByDescending(a => a.ActivityDate).Select(a => MapToDto(a)).ToListAsync();
        }

        public async Task<ActivityDto?> GetByIdAsync(Guid id)
        {
            var a = await _context.Activities.Include(x => x.Customer).Include(x => x.Deal).Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);
            return a == null ? null : MapToDto(a);
        }

        public async Task<ActivityDto> CreateAsync(CreateActivityDto dto, Guid userId)
        {
            var activity = new Activity
            {
                CustomerId = dto.CustomerId, DealId = dto.DealId, UserId = userId,
                ActivityType = dto.ActivityType, Subject = dto.Subject, Description = dto.Description,
                ActivityDate = dto.ActivityDate, NextActionDate = dto.NextActionDate,
                IsCompleted = dto.IsCompleted, Status = dto.Status
            };
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            if (dto.DealId.HasValue)
            {
                var deal = await _context.Deals.FindAsync(dto.DealId.Value);
                if (deal != null) { deal.LastContactDate = dto.ActivityDate; await _context.SaveChangesAsync(); }
            }
            return await GetByIdAsync(activity.Id) ?? MapToDto(activity);
        }

        public async Task<ActivityDto?> UpdateAsync(Guid id, UpdateActivityDto dto)
        {
            var activity = await _context.Activities.FindAsync(id);
            if (activity == null) return null;
            activity.ActivityType = dto.ActivityType; activity.Subject = dto.Subject;
            activity.Description = dto.Description; activity.ActivityDate = dto.ActivityDate;
            activity.NextActionDate = dto.NextActionDate;
            activity.IsCompleted = dto.IsCompleted;
            activity.Status = dto.Status;
            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var a = await _context.Activities.FindAsync(id);
            if (a == null) return false;
            _context.Activities.Remove(a);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ActivityDto>> GetUpcomingAsync(int days = 7)
        {
            var cutoff = DateTime.UtcNow.AddDays(days);
            return await _context.Activities
                .Include(a => a.Customer).Include(a => a.Deal).Include(a => a.User)
                .Where(a => a.NextActionDate.HasValue && a.NextActionDate >= DateTime.UtcNow && a.NextActionDate <= cutoff)
                .OrderBy(a => a.NextActionDate).Select(a => MapToDto(a)).ToListAsync();
        }

        private static ActivityDto MapToDto(Activity a) => new()
        {
            Id = a.Id, CustomerId = a.CustomerId, CustomerName = a.Customer?.CompanyName ?? "",
            DealId = a.DealId, DealCode = a.Deal?.DealCode, ProjectName = a.Deal?.ProjectName,
            UserId = a.UserId, UserName = a.User?.FullName ?? "", ActivityType = a.ActivityType,
            Subject = a.Subject, Description = a.Description, ActivityDate = a.ActivityDate,
            NextActionDate = a.NextActionDate, IsCompleted = a.IsCompleted, Status = a.Status, CreatedAt = a.CreatedAt
        };
    }
}
