using System;

namespace CRM.Domain.Entities
{
    public class AuditLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string TableName { get; set; } = string.Empty;
        public string RecordId { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty; // CREATE, UPDATE, DELETE
        public string? OldValue { get; set; } // JSON
        public string? NewValue { get; set; } // JSON
        public Guid ChangedBy { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? ChangedByUser { get; set; }
    }
}
