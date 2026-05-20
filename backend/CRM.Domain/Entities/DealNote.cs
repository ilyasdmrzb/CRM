using System;

namespace CRM.Domain.Entities
{
    public class DealNote
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DealId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Deal? Deal { get; set; }
    }
}
