using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;

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
    }
}
