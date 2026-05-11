using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        public DashboardService(AppDbContext context) => _context = context;

        public async Task<DashboardDto> GetDashboardDataAsync(DateTime? startDate = null, DateTime? endDate = null, Guid? salesUserId = null, string? city = null, string? sector = null, Guid? customerId = null)
        {
            var dealQuery = _context.Deals
                .Include(d => d.Stage).Include(d => d.SalesUser).Include(d => d.Customer)
                .AsQueryable();

            if (startDate.HasValue) dealQuery = dealQuery.Where(d => d.CreatedAt >= startDate.Value);
            if (endDate.HasValue) dealQuery = dealQuery.Where(d => d.CreatedAt <= endDate.Value);
            if (salesUserId.HasValue) dealQuery = dealQuery.Where(d => d.SalesUserId == salesUserId.Value);
            if (!string.IsNullOrEmpty(city)) dealQuery = dealQuery.Where(d => d.Customer.City == city);
            if (!string.IsNullOrEmpty(sector)) dealQuery = dealQuery.Where(d => d.Customer.Sector == sector);
            if (customerId.HasValue) dealQuery = dealQuery.Where(d => d.CustomerId == customerId.Value);

            var deals = await dealQuery.ToListAsync();

            var openDeals = deals.Where(d => d.Status == "open").ToList();
            var wonDeals = deals.Where(d => d.Status == "won").ToList();
            var lostDeals = deals.Where(d => d.Status == "lost").ToList();

            var stageDistribution = openDeals
                .GroupBy(d => d.Stage?.StageName ?? "Unknown")
                .Select(g => new StageDistributionDto
                {
                    StageName = g.Key,
                    Count = g.Count(),
                    Value = g.Sum(d => d.DealValue ?? 0)
                }).ToList();

            var topSales = deals
                .GroupBy(d => d.SalesUser?.FullName ?? "Unknown")
                .Select(g => new TopSalesUserDto
                {
                    UserName = g.Key,
                    DealCount = g.Count(),
                    PipelineValue = g.Where(d => d.Status == "open").Sum(d => d.DealValue ?? 0),
                    WonCount = g.Count(d => d.Status == "won")
                }).OrderByDescending(x => x.PipelineValue).Take(5).ToList();

            var now = DateTime.UtcNow;
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var activityQuery = _context.Activities
                .Include(a => a.Customer).Include(a => a.Deal).Include(a => a.User)
                .AsQueryable();
            
            if (salesUserId.HasValue) activityQuery = activityQuery.Where(a => a.UserId == salesUserId.Value);
            if (customerId.HasValue) activityQuery = activityQuery.Where(a => a.CustomerId == customerId.Value);

            var activities = await activityQuery.ToListAsync();

            var todayActivities = activities
                .Where(a => a.ActivityDate >= today && a.ActivityDate < tomorrow && !a.IsCompleted)
                .Select(a => new ActivityDto
                {
                    Id = a.Id, CustomerId = a.CustomerId, CustomerName = a.Customer?.CompanyName ?? "",
                    DealId = a.DealId, DealCode = a.Deal?.DealCode, ProjectName = a.Deal?.ProjectName,
                    UserId = a.UserId, UserName = a.User?.FullName ?? "", ActivityType = a.ActivityType,
                    Subject = a.Subject, Description = a.Description, ActivityDate = a.ActivityDate,
                    NextActionDate = a.NextActionDate, IsCompleted = a.IsCompleted, Status = a.Status, CreatedAt = a.CreatedAt
                }).ToList();

            var overdueActivities = activities
                .Where(a => (a.NextActionDate < today || a.ActivityDate < today) && !a.IsCompleted)
                .Select(a => new ActivityDto
                {
                    Id = a.Id, CustomerId = a.CustomerId, CustomerName = a.Customer?.CompanyName ?? "",
                    DealId = a.DealId, DealCode = a.Deal?.DealCode, ProjectName = a.Deal?.ProjectName,
                    UserId = a.UserId, UserName = a.User?.FullName ?? "", ActivityType = a.ActivityType,
                    Subject = a.Subject, Description = a.Description, ActivityDate = a.ActivityDate,
                    NextActionDate = a.NextActionDate, IsCompleted = a.IsCompleted, Status = a.Status, CreatedAt = a.CreatedAt
                }).ToList();

            var monthlyPipeline = Enumerable.Range(0, 6).Select(i =>
            {
                var month = now.AddMonths(-i);
                var monthDeals = deals.Where(d => d.CreatedAt.Year == month.Year && d.CreatedAt.Month == month.Month);
                return new MonthlyPipelineDto
                {
                    Month = month.ToString("MMM yyyy"),
                    Pipeline = monthDeals.Sum(d => d.DealValue ?? 0),
                    Weighted = monthDeals.Sum(d => d.WeightedValue ?? 0)
                };
            }).Reverse().ToList();

            var wonLostChart = Enumerable.Range(0, 6).Select(i =>
            {
                var month = now.AddMonths(-i);
                return new WonLostChartDto
                {
                    Month = month.ToString("MMM yyyy"),
                    Won = wonDeals.Count(d => d.UpdatedAt.Year == month.Year && d.UpdatedAt.Month == month.Month),
                    Lost = lostDeals.Count(d => d.UpdatedAt.Year == month.Year && d.UpdatedAt.Month == month.Month)
                };
            }).Reverse().ToList();

            var closedDealsCount = wonDeals.Count + lostDeals.Count;
            var winRate = closedDealsCount > 0 ? (decimal)wonDeals.Count / closedDealsCount * 100 : 0;
            var avgDealValue = wonDeals.Count > 0 ? wonDeals.Average(d => d.DealValue ?? 0) : 0;
            
            var closingTimes = wonDeals.Concat(lostDeals)
                .Select(d => (d.UpdatedAt - d.CreatedAt).TotalDays)
                .ToList();
            var avgClosingTime = closingTimes.Any() ? closingTimes.Average() : 0;

            return new DashboardDto
            {
                TotalPipeline = openDeals.Sum(d => d.DealValue ?? 0),
                WeightedPipeline = openDeals.Sum(d => d.WeightedValue ?? 0),
                WonDealsValue = wonDeals.Sum(d => d.DealValue ?? 0),
                LostDealsValue = lostDeals.Sum(d => d.DealValue ?? 0),
                TotalMw = openDeals.Sum(d => d.CapacityMw ?? 0),
                OpenDealsCount = openDeals.Count,
                WonDealsCount = wonDeals.Count,
                LostDealsCount = lostDeals.Count,
                WinRate = Math.Round(winRate, 1),
                AverageDealValue = Math.Round(avgDealValue, 0),
                AverageClosingTimeDays = Math.Round(avgClosingTime, 1),
                StageDistribution = stageDistribution,
                MonthlyPipeline = monthlyPipeline,
                TopSalesUsers = topSales,
                WonLostChart = wonLostChart,
                TodayActivities = todayActivities,
                OverdueActivities = overdueActivities
            };
        }

        public async Task<WinLossDto> GetWinLossDataAsync()
        {
            var deals = await _context.Deals
                .Include(d => d.Customer).Include(d => d.Contact)
                .Include(d => d.SalesUser).Include(d => d.Stage).Include(d => d.DealResult)
                .ToListAsync();

            var wonDeals = deals.Where(d => d.Status == "won").ToList();
            var lostDeals = deals.Where(d => d.Status == "lost").ToList();

            var competitorAnalysis = lostDeals
                .Where(d => d.DealResult?.CompetitorName != null)
                .GroupBy(d => d.DealResult!.CompetitorName!)
                .Select(g => new CompetitorAnalysisDto
                {
                    CompetitorName = g.Key,
                    LostCount = g.Count(),
                    LostValue = g.Sum(d => d.DealValue ?? 0)
                }).OrderByDescending(x => x.LostCount).ToList();

            var lossReasons = lostDeals
                .Where(d => d.DealResult?.LossReason != null)
                .GroupBy(d => d.DealResult!.LossReason!)
                .Select(g => new LossReasonDto { Reason = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count).ToList();

            var totalWon = wonDeals.Sum(d => d.DealValue ?? 0);
            var totalLost = lostDeals.Sum(d => d.DealValue ?? 0);
            var total = wonDeals.Count + lostDeals.Count;

            return new WinLossDto
            {
                WonDeals = wonDeals.Select(d => MapDealToDto(d)).ToList(),
                LostDeals = lostDeals.Select(d => MapDealToDto(d)).ToList(),
                CompetitorAnalysis = competitorAnalysis,
                LossReasons = lossReasons,
                TotalWonValue = totalWon,
                TotalLostValue = totalLost,
                WinRate = total > 0 ? Math.Round((decimal)wonDeals.Count / total * 100, 1) : 0
            };
        }

        private static DealDto MapDealToDto(Domain.Entities.Deal d) => new()
        {
            Id = d.Id, DealCode = d.DealCode, CustomerId = d.CustomerId,
            CompanyName = d.Customer?.CompanyName ?? "", City = d.Customer?.City,
            ContactId = d.ContactId, ContactName = d.Contact?.FullName,
            SalesUserId = d.SalesUserId, SalesUserName = d.SalesUser?.FullName ?? "",
            ProjectName = d.ProjectName, StageId = d.StageId, StageName = d.Stage?.StageName ?? "",
            CapacityMw = d.CapacityMw, Probability = d.Probability, JinkoPrice = d.JinkoPrice,
            HsaPrice = d.HsaPrice, DealValue = d.DealValue, WeightedValue = d.WeightedValue,
            TargetPrice = d.TargetPrice, CompetitorName = d.CompetitorName, EpcPartner = d.EpcPartner,
            DeliveryDate = d.DeliveryDate, LastContactDate = d.LastContactDate,
            CurrentUpdate = d.CurrentUpdate, Notes = d.Notes, Status = d.Status,
            CreatedAt = d.CreatedAt, UpdatedAt = d.UpdatedAt
        };
    }
}
