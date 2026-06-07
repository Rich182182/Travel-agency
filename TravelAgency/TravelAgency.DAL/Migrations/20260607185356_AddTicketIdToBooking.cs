using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAgency.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketIdToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TicketId",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_TicketId",
                table: "Bookings",
                column: "TicketId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Tickets_TicketId",
                table: "Bookings",
                column: "TicketId",
                principalTable: "Tickets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Tickets_TicketId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_TicketId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "TicketId",
                table: "Bookings");
        }
    }
}
