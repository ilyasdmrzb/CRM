using System;

namespace CRM.Domain.Entities
{
    public class Activity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CustomerId { get; set; }
        public Guid? DealId { get; set; }
        public Guid UserId { get; set; }
        public string ActivityType { get; set; } = string.Empty; // Call, Meeting, Email, Visit, WhatsApp
        public string Subject { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ActivityDate { get; set; }
        public DateTime? NextActionDate { get; set; }
        public bool IsCompleted { get; set; }
        public string Status { get; set; } = "planned"; // planned, completed, cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Customer? Customer { get; set; }
        public Deal? Deal { get; set; }
        public User? User { get; set; }
    }
}
