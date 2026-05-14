using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly IActivityService _activityService;

        public ActivitiesController(IActivityService activityService)
        {
            _activityService = activityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? customerId, [FromQuery] Guid? dealId, [FromQuery] string? type)
        {
            var activities = await _activityService.GetAllAsync(customerId, dealId, type);
            return Ok(activities);
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming([FromQuery] int days = 7)
        {
            var activities = await _activityService.GetUpcomingAsync(days);
            return Ok(activities);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateActivityDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            var activity = await _activityService.CreateAsync(dto, userId);
            return Ok(activity);
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var current = await _activityService.GetByIdAsync(id);
            if (current == null) return NotFound();

            var updated = await _activityService.UpdateAsync(id, new UpdateActivityDto
            {
                ActivityType = current.ActivityType,
                Subject = current.Subject,
                Description = current.Description,
                ActivityDate = current.ActivityDate,
                NextActionDate = current.NextActionDate,
                IsCompleted = true,
                Status = "completed"
            });

            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _activityService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
