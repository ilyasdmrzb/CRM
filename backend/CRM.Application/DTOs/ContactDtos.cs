namespace CRM.Application.DTOs
{
    public class ContactDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateContactDto
    {
        public Guid CustomerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class UpdateContactDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public bool IsPrimary { get; set; }
    }
}
