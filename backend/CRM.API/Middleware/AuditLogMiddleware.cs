using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Text.Json;

namespace CRM.API.Middleware
{
    public class AuditLogMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditLogMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService)
        {
            var method = context.Request.Method;
            if (method == "POST" || method == "PUT" || method == "PATCH" || method == "DELETE")
            {
                // Note: Real audit logging would capture body content by enabling buffering
                // For simplicity, we'll log the basic action here.
                
                await _next(context);

                if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
                    {
                        var path = context.Request.Path.ToString();
                        var actionType = method switch
                        {
                            "POST" => "CREATE",
                            "PUT" or "PATCH" => "UPDATE",
                            "DELETE" => "DELETE",
                            _ => "OTHER"
                        };

                        // Extract table name from path (e.g., /api/Customers -> Customers)
                        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
                        var tableName = segments.Length > 1 ? segments[1] : "Unknown";

                        await auditLogService.LogAsync(
                            tableName,
                            path, // Simplified record ID
                            actionType,
                            null,
                            null,
                            userId
                        );
                    }
                }
            }
            else
            {
                await _next(context);
            }
        }
    }
}
