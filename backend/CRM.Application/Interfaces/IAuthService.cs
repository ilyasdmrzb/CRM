using CRM.Application.DTOs.Auth;

namespace CRM.Application.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);
        Task<UserDto?> GetCurrentUserAsync(Guid userId);
        Task<List<UserDto>> GetAllUsersAsync();
        Task<UserDto> CreateUserAsync(CreateUserDto dto, Guid createdBy);
        Task<UserDto?> UpdateUserAsync(Guid id, UpdateUserDto dto);
        Task<bool> DeleteUserAsync(Guid id);
    }
}
