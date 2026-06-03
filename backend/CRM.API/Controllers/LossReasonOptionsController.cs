using CRM.Application.DTOs;
using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LossReasonOptionsController : ControllerBase
    {
        private readonly ILossReasonOptionService _lossReasonOptionService;

        public LossReasonOptionsController(ILossReasonOptionService lossReasonOptionService)
        {
            _lossReasonOptionService = lossReasonOptionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
        {
            var options = await _lossReasonOptionService.GetAllAsync(includeInactive);
            return Ok(options);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateLossReasonOptionDto dto)
        {
            try
            {
                var option = await _lossReasonOptionService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetAll), new { id = option.Id }, option);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLossReasonOptionDto dto)
        {
            try
            {
                var option = await _lossReasonOptionService.UpdateAsync(id, dto);
                if (option == null) return NotFound();
                return Ok(option);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _lossReasonOptionService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
