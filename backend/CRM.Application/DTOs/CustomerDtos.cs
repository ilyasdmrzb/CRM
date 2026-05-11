using System.ComponentModel.DataAnnotations;

namespace CRM.Application.DTOs
{
    public class CustomerDto
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? CariCode { get; set; }
        public string? TaxNumber { get; set; }
        public string? City { get; set; }
        public string? Sector { get; set; }
        public string? Address { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public string CreatedByShortName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ContactCount { get; set; }
        public int DealCount { get; set; }
    }

    public class CreateCustomerDto
    {
        [Required(ErrorMessage = "Şirket adı zorunludur.")]
        public string CompanyName { get; set; } = string.Empty;
        public string? CariCode { get; set; }
        public string? TaxNumber { get; set; }
        public string? City { get; set; }
        public string? Sector { get; set; }
        public string? Address { get; set; }
    }

    public class UpdateCustomerDto
    {
        [Required(ErrorMessage = "Şirket adı zorunludur.")]
        public string CompanyName { get; set; } = string.Empty;
        public string? CariCode { get; set; }
        public string? TaxNumber { get; set; }
        public string? City { get; set; }
        public string? Sector { get; set; }
        public string? Address { get; set; }
    }
}
