namespace CRM.Application.DTOs
{
    public class DashboardDto
    {
        public decimal TotalPipeline { get; set; }
        public decimal WeightedPipeline { get; set; }
        public decimal WonDealsValue { get; set; }
        public decimal LostDealsValue { get; set; }
        public decimal TotalMw { get; set; }
        public int OpenDealsCount { get; set; }
        public int WonDealsCount { get; set; }
        public int LostDealsCount { get; set; }
        public List<StageDistributionDto> StageDistribution { get; set; } = new();
        public List<MonthlyPipelineDto> MonthlyPipeline { get; set; } = new();
        public List<TopSalesUserDto> TopSalesUsers { get; set; } = new();
        public List<WonLostChartDto> WonLostChart { get; set; } = new();
    }

    public class StageDistributionDto
    {
        public string StageName { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Value { get; set; }
    }

    public class MonthlyPipelineDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Pipeline { get; set; }
        public decimal Weighted { get; set; }
    }

    public class TopSalesUserDto
    {
        public string UserName { get; set; } = string.Empty;
        public int DealCount { get; set; }
        public decimal PipelineValue { get; set; }
        public int WonCount { get; set; }
    }

    public class WonLostChartDto
    {
        public string Month { get; set; } = string.Empty;
        public int Won { get; set; }
        public int Lost { get; set; }
    }

    public class WinLossDto
    {
        public List<DealDto> WonDeals { get; set; } = new();
        public List<DealDto> LostDeals { get; set; } = new();
        public List<CompetitorAnalysisDto> CompetitorAnalysis { get; set; } = new();
        public List<LossReasonDto> LossReasons { get; set; } = new();
        public decimal TotalWonValue { get; set; }
        public decimal TotalLostValue { get; set; }
        public decimal WinRate { get; set; }
    }

    public class CompetitorAnalysisDto
    {
        public string CompetitorName { get; set; } = string.Empty;
        public int LostCount { get; set; }
        public decimal LostValue { get; set; }
    }

    public class LossReasonDto
    {
        public string Reason { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
