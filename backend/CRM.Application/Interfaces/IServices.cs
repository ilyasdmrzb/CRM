using CRM.Application.DTOs;

namespace CRM.Application.Interfaces
{
    public interface ICustomerService
    {
        Task<List<CustomerDto>> GetAllAsync(string? search = null);
        Task<CustomerDto?> GetByIdAsync(Guid id);
        Task<CustomerDto> CreateAsync(CreateCustomerDto dto, Guid userId);
        Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto);
        Task<bool> DeleteAsync(Guid id);
    }

    public interface IContactService
    {
        Task<List<ContactDto>> GetByCustomerIdAsync(Guid customerId);
        Task<ContactDto?> GetByIdAsync(Guid id);
        Task<ContactDto> CreateAsync(CreateContactDto dto);
        Task<ContactDto?> UpdateAsync(Guid id, UpdateContactDto dto);
        Task<bool> DeleteAsync(Guid id);
    }

    public interface IDealService
    {
        Task<List<DealDto>> GetAllAsync(string? search = null, string? status = null, int? stageId = null);
        Task<DealDto?> GetByIdAsync(Guid id);
        Task<DealDto> CreateAsync(CreateDealDto dto, Guid userId);
        Task<DealDto?> UpdateAsync(Guid id, UpdateDealDto dto, Guid userId);
        Task<bool> DeleteAsync(Guid id);
        Task<DealDto?> UpdateStageAsync(Guid id, UpdateDealStageDto dto, Guid userId);
        Task<DealDto?> CloseDealAsync(Guid id, CloseDealDto dto, Guid userId);
        Task<List<DealDto>> GetByCustomerIdAsync(Guid customerId);
        Task<DealDto?> AddNoteAsync(Guid id, AddDealNoteDto dto, Guid userId);
    }

    public interface IActivityService
    {
        Task<List<ActivityDto>> GetAllAsync(Guid? customerId = null, Guid? dealId = null, string? type = null);
        Task<ActivityDto?> GetByIdAsync(Guid id);
        Task<ActivityDto> CreateAsync(CreateActivityDto dto, Guid userId);
        Task<ActivityDto?> UpdateAsync(Guid id, UpdateActivityDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<List<ActivityDto>> GetUpcomingAsync(int days = 7);
    }

    public interface IDashboardService
    {
        Task<DashboardDto> GetDashboardDataAsync(DateTime? startDate = null, DateTime? endDate = null, Guid? salesUserId = null, string? city = null, string? sector = null, Guid? customerId = null);
        Task<WinLossDto> GetWinLossDataAsync();
    }

    public interface IAuditLogService
    {
        Task LogAsync(string tableName, string recordId, string actionType, string? oldValue, string? newValue, Guid changedBy);
    }
}
