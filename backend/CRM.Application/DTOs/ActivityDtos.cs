namespace CRM.Application.DTOs
{
    public class ActivityDto
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public Guid? DealId { get; set; }
        public string? DealCode { get; set; }
        public string? ProjectName { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ActivityDate { get; set; }
        public DateTime? NextActionDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateActivityDto
    {
        public Guid CustomerId { get; set; }
        public Guid? DealId { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ActivityDate { get; set; }
        public DateTime? NextActionDate { get; set; }
    }

    public class UpdateActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ActivityDate { get; set; }
        public DateTime? NextActionDate { get; set; }
    }
}
