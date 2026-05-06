using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using CRM.Domain.Entities;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Services
{
    public class DealService : IDealService
    {
        private readonly AppDbContext _context;
        public DealService(AppDbContext context) => _context = context;

        public async Task<List<DealDto>> GetAllAsync(string? search = null, string? status = null, int? stageId = null)
        {
            var query = _context.Deals
                .Include(d => d.Customer)
                .Include(d => d.Contact)
                .Include(d => d.SalesUser)
                .Include(d => d.Stage)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(d => d.ProjectName.Contains(search) ||
                    d.DealCode.Contains(search) ||
                    d.Customer.CompanyName.Contains(search));

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(d => d.Status == status);

            if (stageId.HasValue)
                query = query.Where(d => d.StageId == stageId);

            return await query.OrderByDescending(d => d.CreatedAt)
                .Select(d => MapToDto(d)).ToListAsync();
        }

        public async Task<DealDto?> GetByIdAsync(Guid id)
        {
            var d = await _context.Deals
                .Include(x => x.Customer)
                .Include(x => x.Contact)
                .Include(x => x.SalesUser)
                .Include(x => x.Stage)
                .FirstOrDefaultAsync(x => x.Id == id);
            return d == null ? null : MapToDto(d);
        }

        public async Task<List<DealDto>> GetByCustomerIdAsync(Guid customerId)
        {
            return await _context.Deals
                .Include(d => d.Customer)
                .Include(d => d.Contact)
                .Include(d => d.SalesUser)
                .Include(d => d.Stage)
                .Where(d => d.CustomerId == customerId)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => MapToDto(d))
                .ToListAsync();
        }

        public async Task<DealDto> CreateAsync(CreateDealDto dto, Guid userId)
        {
            var stage = await _context.DealStages.FindAsync(dto.StageId)
                ?? throw new InvalidOperationException("Stage bulunamadı.");

            var dealCode = await GenerateDealCodeAsync();
            var weighted = dto.DealValue.HasValue ? dto.DealValue * dto.Probability / 100 : null;

            var deal = new Deal
            {
                DealCode = dealCode,
                CustomerId = dto.CustomerId,
                ContactId = dto.ContactId,
                SalesUserId = dto.SalesUserId != Guid.Empty ? dto.SalesUserId : userId,
                ProjectName = dto.ProjectName,
                StageId = dto.StageId,
                Probability = dto.Probability > 0 ? dto.Probability : stage.Probability,
                CapacityMw = dto.CapacityMw,
                JinkoPrice = dto.JinkoPrice,
                HsaPrice = dto.HsaPrice,
                DealValue = dto.DealValue,
                WeightedValue = weighted,
                TargetPrice = dto.TargetPrice,
                CompetitorName = dto.CompetitorName,
                EpcPartner = dto.EpcPartner,
                DeliveryDate = dto.DeliveryDate,
                LastContactDate = dto.LastContactDate,
                CurrentUpdate = dto.CurrentUpdate,
                Notes = dto.Notes
            };
            _context.Deals.Add(deal);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(deal.Id) ?? MapToDto(deal);
        }

        public async Task<DealDto?> UpdateAsync(Guid id, UpdateDealDto dto)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return null;

            var stage = await _context.DealStages.FindAsync(dto.StageId);
            deal.ContactId = dto.ContactId;
            deal.SalesUserId = dto.SalesUserId;
            deal.ProjectName = dto.ProjectName;
            deal.StageId = dto.StageId;
            deal.Probability = dto.Probability;
            deal.CapacityMw = dto.CapacityMw;
            deal.JinkoPrice = dto.JinkoPrice;
            deal.HsaPrice = dto.HsaPrice;
            deal.DealValue = dto.DealValue;
            deal.WeightedValue = dto.DealValue.HasValue ? dto.DealValue * dto.Probability / 100 : null;
            deal.TargetPrice = dto.TargetPrice;
            deal.CompetitorName = dto.CompetitorName;
            deal.EpcPartner = dto.EpcPartner;
            deal.DeliveryDate = dto.DeliveryDate;
            deal.LastContactDate = dto.LastContactDate;
            deal.CurrentUpdate = dto.CurrentUpdate;
            deal.Notes = dto.Notes;
            deal.Status = dto.Status;
            deal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<DealDto?> UpdateStageAsync(Guid id, UpdateDealStageDto dto)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return null;

            var stage = await _context.DealStages.FindAsync(dto.StageId);
            deal.StageId = dto.StageId;
            deal.Probability = dto.Probability ?? stage?.Probability ?? deal.Probability;
            deal.WeightedValue = deal.DealValue.HasValue ? deal.DealValue * deal.Probability / 100 : null;
            deal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<DealDto?> CloseDealAsync(Guid id, CloseDealDto dto)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return null;

            deal.Status = dto.Result == "won" ? "won" : "lost";
            deal.UpdatedAt = DateTime.UtcNow;

            if (dto.Result == "won")
            {
                deal.StageId = 6; // Closed Won
                deal.Probability = 100;
            }
            else
            {
                deal.StageId = 7; // Closed Lost
                deal.Probability = 0;
            }

            var result = new DealResult
            {
                DealId = id,
                Result = dto.Result,
                LossReason = dto.LossReason,
                CompetitorName = dto.CompetitorName,
                ClosedDate = dto.ClosedDate
            };
            _context.DealResults.Add(result);
            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return false;
            _context.Deals.Remove(deal);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<string> GenerateDealCodeAsync()
        {
            var last = await _context.Deals
                .OrderByDescending(d => d.DealCode)
                .Select(d => d.DealCode)
                .FirstOrDefaultAsync();

            int next = 1;
            if (last != null && last.StartsWith("DEAL-"))
            {
                if (int.TryParse(last[5..], out int num)) next = num + 1;
            }
            return $"DEAL-{next:D4}";
        }

        private static DealDto MapToDto(Deal d) => new()
        {
            Id = d.Id,
            DealCode = d.DealCode,
            CustomerId = d.CustomerId,
            CompanyName = d.Customer?.CompanyName ?? "",
            City = d.Customer?.City,
            ContactId = d.ContactId,
            ContactName = d.Contact?.FullName,
            SalesUserId = d.SalesUserId,
            SalesUserName = d.SalesUser?.FullName ?? "",
            ProjectName = d.ProjectName,
            StageId = d.StageId,
            StageName = d.Stage?.StageName ?? "",
            CapacityMw = d.CapacityMw,
            Probability = d.Probability,
            JinkoPrice = d.JinkoPrice,
            HsaPrice = d.HsaPrice,
            DealValue = d.DealValue,
            WeightedValue = d.WeightedValue,
            TargetPrice = d.TargetPrice,
            CompetitorName = d.CompetitorName,
            EpcPartner = d.EpcPartner,
            DeliveryDate = d.DeliveryDate,
            LastContactDate = d.LastContactDate,
            CurrentUpdate = d.CurrentUpdate,
            Notes = d.Notes,
            Status = d.Status,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        };
    }
}
