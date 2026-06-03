using System;
using CRM.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(AppDbContext))]
    [Migration("20260522090000_AddLossReasonOptions")]
    public partial class AddLossReasonOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LossReasonOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LossReasonOptions", x => x.Id);
                });

            migrationBuilder.Sql("""
                SET IDENTITY_INSERT [LossReasonOptions] ON;

                INSERT INTO [LossReasonOptions] ([Id], [CreatedAt], [IsActive], [Name], [SortOrder], [UpdatedAt])
                VALUES
                    (1, '2024-01-01T00:00:00.0000000', 1, N'Fiyat (Yüksek)', 1, '2024-01-01T00:00:00.0000000'),
                    (2, '2024-01-01T00:00:00.0000000', 1, N'Teknik Yetersizlik', 2, '2024-01-01T00:00:00.0000000'),
                    (3, '2024-01-01T00:00:00.0000000', 1, N'Teslim Süresi', 3, '2024-01-01T00:00:00.0000000'),
                    (4, '2024-01-01T00:00:00.0000000', 1, N'Müşteri Kararsızlığı', 4, '2024-01-01T00:00:00.0000000'),
                    (5, '2024-01-01T00:00:00.0000000', 1, N'Finansal Nedenler', 5, '2024-01-01T00:00:00.0000000'),
                    (6, '2024-01-01T00:00:00.0000000', 1, N'Rakip Üstünlüğü', 6, '2024-01-01T00:00:00.0000000'),
                    (7, '2024-01-01T00:00:00.0000000', 1, N'İlişki Yönetimi', 7, '2024-01-01T00:00:00.0000000'),
                    (8, '2024-01-01T00:00:00.0000000', 1, N'Proje İptal Edildi', 8, '2024-01-01T00:00:00.0000000'),
                    (9, '2024-01-01T00:00:00.0000000', 1, N'Diğer', 9, '2024-01-01T00:00:00.0000000');

                SET IDENTITY_INSERT [LossReasonOptions] OFF;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_LossReasonOptions_Name",
                table: "LossReasonOptions",
                column: "Name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LossReasonOptions");
        }
    }
}
