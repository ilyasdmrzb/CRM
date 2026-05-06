namespace CRM.Application.DTOs
{
    public class DealDto
    {
        public Guid Id { get; set; }
        public string DealCode { get; set; } = string.Empty;
        public Guid CustomerId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? City { get; set; }
        public Guid? ContactId { get; set; }
        public string? ContactName { get; set; }
        public Guid SalesUserId { get; set; }
        public string SalesUserName { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public int StageId { get; set; }
        public string StageName { get; set; } = string.Empty;
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
        public string Status { get; set; } = "open";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateDealDto
    {
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
        public decimal? TargetPrice { get; set; }
        public string? CompetitorName { get; set; }
        public string? EpcPartner { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? LastContactDate { get; set; }
        public string? CurrentUpdate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateDealDto
    {
        public Guid? ContactId { get; set; }
        public Guid SalesUserId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public int StageId { get; set; }
        public decimal? CapacityMw { get; set; }
        public int Probability { get; set; }
        public decimal? JinkoPrice { get; set; }
        public decimal? HsaPrice { get; set; }
        public decimal? DealValue { get; set; }
        public decimal? TargetPrice { get; set; }
        public string? CompetitorName { get; set; }
        public string? EpcPartner { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? LastContactDate { get; set; }
        public string? CurrentUpdate { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = "open";
    }

    public class UpdateDealStageDto
    {
        public int StageId { get; set; }
        public int? Probability { get; set; }
    }

    public class CloseDealDto
    {
        public string Result { get; set; } = string.Empty; // won, lost
        public string? LossReason { get; set; }
        public string? CompetitorName { get; set; }
        public DateTime ClosedDate { get; set; }
    }
}
