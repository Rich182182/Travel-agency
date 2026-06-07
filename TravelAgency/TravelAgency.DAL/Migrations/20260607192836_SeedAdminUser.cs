using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAgency.DAL.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "Role" },
                values: new object[] { 3, "admin@gmail.com", "$2a$11$pG4V7Y2y8R0L.D/3I.6g.OQk9u.T/Qk7eL5v8/1H1J9T/R0L.D/3I", "Admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
