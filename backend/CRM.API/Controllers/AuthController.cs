using CRM.Application.DTOs.Auth;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Geçersiz e-posta veya şifre." });

            return Ok(response);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            var user = await _authService.GetCurrentUserAsync(userId);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpGet("users")]
        [Authorize]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPost("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdClaim?.Value, out Guid createdBy);

            var user = await _authService.CreateUserAsync(dto, createdBy);
            return Ok(user);
        }

        [HttpPut("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser([FromRoute] Guid id, [FromBody] UpdateUserDto dto)
        {
            var user = await _authService.UpdateUserAsync(id, dto);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpDelete("users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser([FromRoute] Guid id)
        {
            try
            {
                var success = await _authService.DeleteUserAsync(id);
                if (!success) return NotFound();
                return Ok(new { message = "Kullanıcı kalıcı olarak silindi." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("users/{id}/delete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUserPost([FromRoute] Guid id)
        {
            try
            {
                var success = await _authService.DeleteUserAsync(id);
                if (!success) return NotFound();
                return Ok(new { message = "Kullanıcı kalıcı olarak silindi." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}

