using CRM.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Text.Json;
using System.Text;

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
                var requestBody = await ReadRequestBodyAsync(context.Request);
                
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

                        var details = JsonSerializer.Serialize(new
                        {
                            method,
                            path,
                            query = context.Request.QueryString.ToString(),
                            statusCode = context.Response.StatusCode,
                            requestBody = RedactSensitiveFields(requestBody)
                        });

                        await auditLogService.LogAsync(
                            tableName,
                            path, // Simplified record ID
                            actionType,
                            null,
                            details,
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

        private static async Task<string?> ReadRequestBodyAsync(HttpRequest request)
        {
            if (request.ContentLength is null or 0)
                return null;

            request.EnableBuffering();
            using var reader = new StreamReader(request.Body, Encoding.UTF8, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;

            return string.IsNullOrWhiteSpace(body) ? null : body;
        }

        private static string? RedactSensitiveFields(string? requestBody)
        {
            if (string.IsNullOrWhiteSpace(requestBody))
                return null;

            try
            {
                using var document = JsonDocument.Parse(requestBody);
                var redacted = RedactElement(document.RootElement);
                return JsonSerializer.Serialize(redacted);
            }
            catch (JsonException)
            {
                return requestBody;
            }
        }

        private static object? RedactElement(JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.Object => element.EnumerateObject().ToDictionary(
                    property => property.Name,
                    property => property.Name.Contains("password", StringComparison.OrdinalIgnoreCase)
                        ? "***"
                        : RedactElement(property.Value)),
                JsonValueKind.Array => element.EnumerateArray().Select(RedactElement).ToList(),
                JsonValueKind.String => element.GetString(),
                JsonValueKind.Number => element.TryGetInt64(out var longValue) ? longValue : element.GetDecimal(),
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                _ => null
            };
        }
    }
}
