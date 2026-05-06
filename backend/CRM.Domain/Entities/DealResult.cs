using System;

namespace CRM.Domain.Entities
{
    public class DealResult
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DealId { get; set; }
        public string Result { get; set; } = string.Empty; // won, lost
        public string? LossReason { get; set; }
        public string? CompetitorName { get; set; }
        public DateTime ClosedDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Deal? Deal { get; set; }
    }
}
