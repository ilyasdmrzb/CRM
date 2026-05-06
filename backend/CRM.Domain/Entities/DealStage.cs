using System;

namespace CRM.Domain.Entities
{
    public class DealStage
    {
        public int Id { get; set; }
        public string StageName { get; set; } = string.Empty;
        public int Probability { get; set; }
        public int StageOrder { get; set; }

        // Navigation
        public ICollection<Deal> Deals { get; set; } = new List<Deal>();
    }
}
