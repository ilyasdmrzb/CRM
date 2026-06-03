using CRM.Application.DTOs.Auth;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly AppDbContext _context;
        public AuditLogService(AppDbContext context) => _context = context;

        public async Task LogAsync(string tableName, string recordId, string actionType, string? oldValue, string? newValue, Guid changedBy)
        {
            var log = new AuditLog
            {
                TableName = tableName,
                RecordId = recordId,
                ActionType = actionType,
                OldValue = oldValue,
                NewValue = newValue,
                ChangedBy = changedBy
            };
            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLogDto>> GetAllAsync(Guid? userId = null, string? actionType = null, string? tableName = null, int take = 200)
        {
            take = Math.Clamp(take, 1, 1000);

            var query = _context.AuditLogs
                .Include(x => x.ChangedByUser)
                .AsQueryable();

            if (userId.HasValue)
                query = query.Where(x => x.ChangedBy == userId.Value);

            if (!string.IsNullOrWhiteSpace(actionType))
                query = query.Where(x => x.ActionType == actionType);

            if (!string.IsNullOrWhiteSpace(tableName))
                query = query.Where(x => x.TableName == tableName);

            return await query
                .OrderByDescending(x => x.ChangedAt)
                .Take(take)
                .Select(x => new AuditLogDto
                {
                    Id = x.Id,
                    TableName = x.TableName,
                    RecordId = x.RecordId,
                    ActionType = x.ActionType,
                    OldValue = x.OldValue,
                    NewValue = x.NewValue,
                    ChangedBy = x.ChangedBy,
                    ChangedByName = x.ChangedByUser != null ? x.ChangedByUser.FullName : "Bilinmeyen Kullanıcı",
                    ChangedByEmail = x.ChangedByUser != null ? x.ChangedByUser.Email : "",
                    ChangedAt = x.ChangedAt
                })
                .ToListAsync();
        }
    }
}
