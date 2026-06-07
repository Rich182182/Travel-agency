using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAgency.DAL.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdminUser3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$/br4b6HJ/4XgpH689omInOpF7OhGhHRd.eP7MfSwDOWBQ84dY0p8G");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI0IiwiZW1haWwiOiJhZG1pbjFAZ21haWwuY29tIiwicm9sZSI6IkNsaWVudCIsIm5iZiI6MTc4MDg2MDY3NSwiZXhwIjoxNzgwODY3ODc1LCJpYXQiOjE3ODA4NjA2NzUsImlzcyI6IlRyYXZlbEFnZW5jeUFQSSIsImF1ZCI6IlRyYXZlbEFnZW5jeVJlYWN0QXBwIn0._58Ea4nXacCFDECzzZB4BjM3iWWki9aiDq2-V2k5Qys");
        }
    }
}
