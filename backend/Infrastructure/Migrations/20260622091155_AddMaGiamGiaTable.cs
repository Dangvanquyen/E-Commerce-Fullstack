using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMaGiamGiaTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MaGiamGiaId",
                table: "DonHang",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TienGiam",
                table: "DonHang",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "MaGiamGia",
                columns: table => new
                {
                    MaGiamGiaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    LoaiGiamGia = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "PhanTram"),
                    GiaTri = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GiaTriGiamToiDa = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    DonHangToiThieu = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SoLuong = table.Column<int>(type: "int", nullable: false),
                    SoLuongDaDung = table.Column<int>(type: "int", nullable: false),
                    TrangThai = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaGiamGia", x => x.MaGiamGiaId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DonHang_MaGiamGiaId",
                table: "DonHang",
                column: "MaGiamGiaId");

            migrationBuilder.CreateIndex(
                name: "IX_MaGiamGia_Code",
                table: "MaGiamGia",
                column: "Code",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DonHang_MaGiamGia_MaGiamGiaId",
                table: "DonHang",
                column: "MaGiamGiaId",
                principalTable: "MaGiamGia",
                principalColumn: "MaGiamGiaId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DonHang_MaGiamGia_MaGiamGiaId",
                table: "DonHang");

            migrationBuilder.DropTable(
                name: "MaGiamGia");

            migrationBuilder.DropIndex(
                name: "IX_DonHang_MaGiamGiaId",
                table: "DonHang");

            migrationBuilder.DropColumn(
                name: "MaGiamGiaId",
                table: "DonHang");

            migrationBuilder.DropColumn(
                name: "TienGiam",
                table: "DonHang");
        }
    }
}
