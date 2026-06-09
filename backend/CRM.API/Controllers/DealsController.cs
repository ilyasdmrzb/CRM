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
    public class DealsController : ControllerBase
    {
        private readonly IDealService _dealService;

        public DealsController(IDealService dealService)
        {
            _dealService = dealService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? status, [FromQuery] int? stageId)
        {
            var deals = await _dealService.GetAllAsync(search, status, stageId);
            return Ok(deals);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var deal = await _dealService.GetByIdAsync(id);
            if (deal == null) return NotFound();
            return Ok(deal);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDealDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            var deal = await _dealService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = deal.Id }, deal);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDealDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            var deal = await _dealService.UpdateAsync(id, dto, userId);
            if (deal == null) return NotFound();
            return Ok(deal);
        }

        [HttpPatch("{id}/stage")]
        public async Task<IActionResult> UpdateStage(Guid id, [FromBody] UpdateDealStageDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            var deal = await _dealService.UpdateStageAsync(id, dto, userId);
            if (deal == null) return NotFound();
            return Ok(deal);
        }

        [HttpPost("{id}/close")]
        public async Task<IActionResult> CloseDeal(Guid id, [FromBody] CloseDealDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            try
            {
                var deal = await _dealService.CloseDealAsync(id, dto, userId);
                if (deal == null) return NotFound();
                return Ok(deal);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/notes")]
        public async Task<IActionResult> AddNote(Guid id, [FromBody] AddDealNoteDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out Guid userId))
                return Unauthorized();

            var deal = await _dealService.AddNoteAsync(id, dto, userId);
            if (deal == null) return NotFound();
            return Ok(deal);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var result = await _dealService.DeleteAsync(id);
                if (!result) return NotFound();
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
