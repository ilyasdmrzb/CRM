using System;

namespace CRM.Domain.Entities
{
    public class Customer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CompanyName { get; set; } = string.Empty;
        public string? CariCode { get; set; }
        public string? TaxNumber { get; set; }
        public string? City { get; set; }
        public string? Address { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? Creator { get; set; }
        public ICollection<Contact> Contacts { get; set; } = new List<Contact>();
        public ICollection<Deal> Deals { get; set; } = new List<Deal>();
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }
}
