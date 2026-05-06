using System;

namespace CRM.Domain.Entities
{
    public class Contact
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool IsPrimary { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Customer? Customer { get; set; }
        public ICollection<Deal> Deals { get; set; } = new List<Deal>();
    }
}
