using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] Guid? salesUserId = null,
            [FromQuery] string? city = null,
            [FromQuery] string? sector = null,
            [FromQuery] Guid? customerId = null)
        {
            var data = await _dashboardService.GetDashboardDataAsync(startDate, endDate, salesUserId, city, sector, customerId);
            return Ok(data);
        }

        [HttpGet("win-loss")]
        public async Task<IActionResult> GetWinLoss()
        {
            var data = await _dashboardService.GetWinLossDataAsync();
            return Ok(data);
        }
    }
}
