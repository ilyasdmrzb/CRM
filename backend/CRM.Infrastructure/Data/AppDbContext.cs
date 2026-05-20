using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Contact> Contacts => Set<Contact>();
        public DbSet<DealStage> DealStages => Set<DealStage>();
        public DbSet<Deal> Deals => Set<Deal>();
        public DbSet<DealNote> DealNotes => Set<DealNote>();
        public DbSet<Activity> Activities => Set<Activity>();
        public DbSet<DealResult> DealResults => Set<DealResult>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.Email).IsUnique();
                e.Property(x => x.Role).HasDefaultValue("Sales");
            });

            // Customer
            modelBuilder.Entity<Customer>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.CompanyName).IsUnique();
                e.HasOne(x => x.Creator).WithMany(u => u.CreatedCustomers)
                    .HasForeignKey(x => x.CreatedBy).OnDelete(DeleteBehavior.Restrict);
            });

            // Contact
            modelBuilder.Entity<Contact>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Customer).WithMany(c => c.Contacts)
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);
            });

            // DealStage
            modelBuilder.Entity<DealStage>(e =>
            {
                e.HasKey(x => x.Id);
            });

            // Deal
            modelBuilder.Entity<Deal>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasIndex(x => x.DealCode).IsUnique();
                e.Property(x => x.DealValue).HasColumnType("decimal(18,2)");
                e.Property(x => x.WeightedValue).HasColumnType("decimal(18,2)");
                e.Property(x => x.JinkoPrice).HasColumnType("decimal(18,4)");
                e.Property(x => x.HsaPrice).HasColumnType("decimal(18,4)");
                e.Property(x => x.TargetPrice).HasColumnType("decimal(18,4)");
                e.Property(x => x.CapacityMw).HasColumnType("decimal(18,3)");

                e.HasOne(x => x.Customer).WithMany(c => c.Deals)
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Contact).WithMany(c => c.Deals)
                    .HasForeignKey(x => x.ContactId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.SalesUser).WithMany(u => u.Deals)
                    .HasForeignKey(x => x.SalesUserId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Stage).WithMany(s => s.Deals)
                    .HasForeignKey(x => x.StageId).OnDelete(DeleteBehavior.Restrict);
            });

            // DealNote
            modelBuilder.Entity<DealNote>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Deal).WithMany(d => d.NoteHistory)
                    .HasForeignKey(x => x.DealId).OnDelete(DeleteBehavior.Cascade);
            });

            // Activity
            modelBuilder.Entity<Activity>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Customer).WithMany(c => c.Activities)
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Deal).WithMany(d => d.Activities)
                    .HasForeignKey(x => x.DealId).OnDelete(DeleteBehavior.SetNull);
                e.HasOne(x => x.User).WithMany(u => u.Activities)
                    .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
            });

            // DealResult
            modelBuilder.Entity<DealResult>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.Deal).WithOne(d => d.DealResult)
                    .HasForeignKey<DealResult>(x => x.DealId).OnDelete(DeleteBehavior.Cascade);
            });

            // AuditLog
            modelBuilder.Entity<AuditLog>(e =>
            {
                e.HasKey(x => x.Id);
                e.HasOne(x => x.ChangedByUser).WithMany(u => u.AuditLogs)
                    .HasForeignKey(x => x.ChangedBy).OnDelete(DeleteBehavior.Restrict);
                e.Property(x => x.OldValue).HasColumnType("nvarchar(max)");
                e.Property(x => x.NewValue).HasColumnType("nvarchar(max)");
            });

            // Seed DealStages
            modelBuilder.Entity<DealStage>().HasData(
                new DealStage { Id = 1, StageName = "Prospecting", Probability = 10, StageOrder = 1 },
                new DealStage { Id = 2, StageName = "Qualification", Probability = 25, StageOrder = 2 },
                new DealStage { Id = 3, StageName = "Proposal", Probability = 40, StageOrder = 3 },
                new DealStage { Id = 4, StageName = "Negotiation", Probability = 65, StageOrder = 4 },
                new DealStage { Id = 5, StageName = "Commit", Probability = 85, StageOrder = 5 },
                new DealStage { Id = 6, StageName = "Closed Won", Probability = 100, StageOrder = 6 },
                new DealStage { Id = 7, StageName = "Closed Lost", Probability = 0, StageOrder = 7 },
                new DealStage { Id = 8, StageName = "On Hold", Probability = 0, StageOrder = 8 }
            );

            // Seed Admin User
            var adminId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = adminId,
                FullName = "System Admin",
                Email = "admin@company.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = "Admin",
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true
            });
        }
    }
}
