using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAgency.DAL.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "PasswordHash", "Role" },
                values: new object[] { 4, "admin1@gmail.com", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI0IiwiZW1haWwiOiJhZG1pbjFAZ21haWwuY29tIiwicm9sZSI6IkNsaWVudCIsIm5iZiI6MTc4MDg2MDY3NSwiZXhwIjoxNzgwODY3ODc1LCJpYXQiOjE3ODA4NjA2NzUsImlzcyI6IlRyYXZlbEFnZW5jeUFQSSIsImF1ZCI6IlRyYXZlbEFnZW5jeVJlYWN0QXBwIn0._58Ea4nXacCFDECzzZB4BjM3iWWki9aiDq2-V2k5Qys", "Admin" });
        }


    }
}
