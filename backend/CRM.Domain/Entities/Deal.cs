using System;

namespace CRM.Domain.Entities
{
    public class Deal
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string DealCode { get; set; } = string.Empty; // DEAL-0001
        public Guid CustomerId { get; set; }
        public Guid? ContactId { get; set; }
        public Guid SalesUserId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int StageId { get; set; }
        public decimal? CapacityMw { get; set; }
        public int Probability { get; set; }
        public decimal? JinkoPrice { get; set; }
        public decimal? HsaPrice { get; set; }
        public decimal? DealValue { get; set; }
        public decimal? WeightedValue { get; set; }
        public decimal? TargetPrice { get; set; }
        public string? CompetitorName { get; set; }
        public string? EpcPartner { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? LastContactDate { get; set; }
        public string? CurrentUpdate { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = "open"; // open, won, lost
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Customer? Customer { get; set; }
        public Contact? Contact { get; set; }
        public User? SalesUser { get; set; }
        public DealStage? Stage { get; set; }
        public DealResult? DealResult { get; set; }
        public ICollection<Activity> Activities { get; set; } = new List<Activity>();
    }
}
