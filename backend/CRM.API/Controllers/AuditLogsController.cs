using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? userId,
            [FromQuery] string? actionType,
            [FromQuery] string? tableName,
            [FromQuery] int take = 200)
        {
            var logs = await _auditLogService.GetAllAsync(userId, actionType, tableName, take);
            return Ok(logs);
        }
    }
}
