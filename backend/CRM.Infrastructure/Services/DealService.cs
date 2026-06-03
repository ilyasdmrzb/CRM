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
                .Include(d => d.Activities)
                .Include(d => d.DealResult)
                .Include(d => d.NoteHistory)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(d => d.ProjectName.Contains(search) ||
                    d.DealCode.Contains(search) ||
                    (d.Customer != null && d.Customer.CompanyName.Contains(search)));

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
                .Include(x => x.Activities)
                .Include(x => x.DealResult)
                .Include(x => x.NoteHistory)
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
                .Include(d => d.Activities)
                .Include(d => d.DealResult)
                .Include(d => d.NoteHistory)
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

            if (!string.IsNullOrWhiteSpace(dto.Notes))
            {
                var note = new DealNote
                {
                    DealId = deal.Id,
                    Text = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.DealNotes.Add(note);
                await _context.SaveChangesAsync();
            }

            return await GetByIdAsync(deal.Id) ?? MapToDto(deal);
        }

        public async Task<DealDto?> UpdateAsync(Guid id, UpdateDealDto dto, Guid userId)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return null;

            bool priceChanged = deal.JinkoPrice != dto.JinkoPrice ||
                                deal.HsaPrice != dto.HsaPrice ||
                                deal.DealValue != dto.DealValue ||
                                deal.TargetPrice != dto.TargetPrice;

            bool detailsChanged = deal.ContactId != dto.ContactId ||
                                  deal.SalesUserId != dto.SalesUserId ||
                                  deal.ProjectName != dto.ProjectName ||
                                  deal.StageId != dto.StageId ||
                                  deal.Probability != dto.Probability ||
                                  deal.CapacityMw != dto.CapacityMw ||
                                  deal.CompetitorName != dto.CompetitorName ||
                                  deal.EpcPartner != dto.EpcPartner ||
                                  deal.DeliveryDate != dto.DeliveryDate ||
                                  deal.Notes != dto.Notes ||
                                  deal.Status != dto.Status;

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

            if (priceChanged)
            {
                var activity = new Activity
                {
                    CustomerId = deal.CustomerId,
                    DealId = deal.Id,
                    UserId = userId,
                    ActivityType = "Fiyat Güncellemesi",
                    Subject = "Fiyat Güncellemesi",
                    Description = $"Proje: {deal.ProjectName}. Fiyatlar güncellendi. Yeni Değerler -> Jinko: {dto.JinkoPrice}, HSA: {dto.HsaPrice}, Toplam Değer: {dto.DealValue}, Hedef Fiyat: {dto.TargetPrice}",
                    ActivityDate = DateTime.Now,
                    IsCompleted = true,
                    Status = "completed",
                    CompletedAt = DateTime.Now
                };
                _context.Activities.Add(activity);
            }
            else if (detailsChanged)
            {
                var activity = new Activity
                {
                    CustomerId = deal.CustomerId,
                    DealId = deal.Id,
                    UserId = userId,
                    ActivityType = "Fırsat Güncellemesi",
                    Subject = "Fırsat Detayları Güncellendi",
                    Description = $"Proje: {deal.ProjectName}. Fırsat detayları güncellendi.",
                    ActivityDate = DateTime.Now,
                    IsCompleted = true,
                    Status = "completed",
                    CompletedAt = DateTime.Now
                };
                _context.Activities.Add(activity);
            }

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<DealDto?> UpdateStageAsync(Guid id, UpdateDealStageDto dto, Guid userId)
        {
            var deal = await _context.Deals.Include(d => d.Stage).FirstOrDefaultAsync(d => d.Id == id);
            if (deal == null) return null;

            var oldStageName = deal.Stage?.StageName ?? "Bilinmiyor";
            var stage = await _context.DealStages.FindAsync(dto.StageId);
            var newStageName = stage?.StageName ?? "Bilinmiyor";

            deal.StageId = dto.StageId;
            deal.Probability = dto.Probability ?? stage?.Probability ?? deal.Probability;
            deal.WeightedValue = deal.DealValue.HasValue ? deal.DealValue * deal.Probability / 100 : null;
            deal.UpdatedAt = DateTime.UtcNow;

            var activity = new Activity
            {
                CustomerId = deal.CustomerId,
                DealId = deal.Id,
                UserId = userId,
                ActivityType = "Fırsat Güncellemesi",
                Subject = "Aşama Güncellemesi",
                Description = $"Proje: {deal.ProjectName}. Aşama değiştirildi: '{oldStageName}' -> '{newStageName}'",
                ActivityDate = DateTime.Now,
                IsCompleted = true,
                Status = "completed",
                CompletedAt = DateTime.Now
            };
            _context.Activities.Add(activity);

            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<DealDto?> CloseDealAsync(Guid id, CloseDealDto dto, Guid userId)
        {
            var deal = await _context.Deals.Include(d => d.DealResult).FirstOrDefaultAsync(d => d.Id == id);
            if (deal == null) return null;

            var oldStatus = deal.Status;

            if ((dto.Result == "lost" || dto.Result == "stopped") && string.IsNullOrWhiteSpace(dto.LossReason))
                throw new InvalidOperationException("Kaybetme nedeni zorunludur.");

            if ((dto.Result == "lost" || dto.Result == "stopped") && !string.IsNullOrWhiteSpace(dto.LossReason))
            {
                dto.LossReason = string.Join(" ", dto.LossReason.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
                var reasonExists = await _context.LossReasonOptions.AnyAsync(x => x.IsActive && x.Name == dto.LossReason);
                if (!reasonExists)
                    throw new InvalidOperationException("Kaybetme nedeni admin panelindeki aktif seçeneklerden biri olmalıdır.");
            }
            deal.Status = dto.Result == "won" ? "won" : "lost";
            deal.UpdatedAt = DateTime.UtcNow;

            if (dto.Result == "won")
            {
                deal.StageId = 6; // Closed Won
                deal.Probability = 100;
            }
            else if (dto.Result == "stopped")
            {
                deal.StageId = 8; // On Hold
                deal.Probability = 0;
            }
            else
            {
                deal.StageId = 7; // Closed Lost
                deal.Probability = 0;
            }

            if (deal.DealResult == null)
            {
                var result = new DealResult
                {
                    DealId = id,
                    Result = dto.Result,
                    LossReason = dto.LossReason,
                    CompetitorName = dto.CompetitorName,
                    ClosedDate = dto.ClosedDate
                };
                _context.DealResults.Add(result);
            }
            else
            {
                deal.DealResult.Result = dto.Result;
                deal.DealResult.LossReason = dto.LossReason;
                deal.DealResult.CompetitorName = dto.CompetitorName;
                deal.DealResult.ClosedDate = dto.ClosedDate;
            }

            var activity = new Activity
            {
                CustomerId = deal.CustomerId,
                DealId = deal.Id,
                UserId = userId,
                ActivityType = "Fırsat Güncellemesi",
                Subject = "Fırsat Kapatıldı",
                Description = $"Proje: {deal.ProjectName}. Durum güncellendi: '{oldStatus}' -> '{deal.Status}' ({dto.Result})",
                ActivityDate = DateTime.Now,
                IsCompleted = true,
                Status = "completed",
                CompletedAt = DateTime.Now
            };
            _context.Activities.Add(activity);
            
            await _context.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<DealDto?> AddNoteAsync(Guid id, AddDealNoteDto dto, Guid userId)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return null;

            var note = new DealNote
            {
                DealId = id,
                Text = dto.Text,
                CreatedAt = DateTime.UtcNow
            };

            _context.DealNotes.Add(note);

            var activity = new Activity
            {
                CustomerId = deal.CustomerId,
                DealId = deal.Id,
                UserId = userId,
                ActivityType = "Not Ekleme",
                Subject = "Yeni Not Ekleme",
                Description = $"Proje: {deal.ProjectName}. Deal'a yeni not eklendi: \"{(dto.Text.Length > 60 ? dto.Text[..60] + "..." : dto.Text)}\"",
                ActivityDate = DateTime.Now,
                IsCompleted = true,
                Status = "completed",
                CompletedAt = DateTime.Now
            };
            _context.Activities.Add(activity);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var deal = await _context.Deals.FindAsync(id);
            if (deal == null) return false;

            try
            {
                _context.Deals.Remove(deal);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                throw new InvalidOperationException("Bu anlaşmaya bağlı aktiviteler olduğu için silinemez. Lütfen önce bağlı aktiviteleri silin.");
            }
        }

        private async Task<string> GenerateDealCodeAsync()
        {
            var now = DateTime.Now;
            var prefix = $"{now:yyMM}";

            var lastCode = await _context.Deals
                .Where(d => d.DealCode.StartsWith(prefix))
                .OrderByDescending(d => d.DealCode)
                .Select(d => d.DealCode)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (lastCode != null && lastCode.Length > 4)
            {
                if (int.TryParse(lastCode[4..], out int lastNum))
                {
                    nextNumber = lastNum + 1;
                }
            }

            return $"{prefix}{nextNumber}";
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
            SalesUserShortName = d.SalesUser?.GetInitials() ?? "??",
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
            CompetitorName = d.DealResult?.CompetitorName ?? d.CompetitorName,
            LossReason = d.DealResult?.LossReason,
            EpcPartner = d.EpcPartner,
            DeliveryDate = d.DeliveryDate,
            LastContactDate = d.LastContactDate,
            CurrentUpdate = d.CurrentUpdate,
            Notes = d.Notes,
            Status = d.Status,
            NoteHistory = GetNoteHistoryList(d),
            LastActivityDate = d.Activities?.Where(a => a.IsCompleted).OrderByDescending(a => a.ActivityDate).FirstOrDefault()?.ActivityDate,
            NextActionDate = d.Activities?.Where(a => !a.IsCompleted).OrderBy(a => a.ActivityDate).FirstOrDefault()?.ActivityDate,
            NextActionSubject = d.Activities?.Where(a => !a.IsCompleted).OrderBy(a => a.ActivityDate).FirstOrDefault()?.Subject,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt
        };

        private static List<DealNoteDto> GetNoteHistoryList(Deal d)
        {
            var list = d.NoteHistory?.OrderByDescending(n => n.CreatedAt).Select(n => new DealNoteDto
            {
                Id = n.Id,
                Text = n.Text,
                CreatedAt = n.CreatedAt
            }).ToList() ?? new List<DealNoteDto>();

            if (!string.IsNullOrWhiteSpace(d.Notes) && !list.Any(n => n.Text == d.Notes))
            {
                list.Add(new DealNoteDto
                {
                    Id = Guid.Empty,
                    Text = d.Notes,
                    CreatedAt = d.CreatedAt
                });
            }
            return list;
        }
    }
}

