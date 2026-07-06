using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLichSuXemSanPham : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LichSuXemSanPham",
                columns: table => new
                {
                    LichSuId = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SanPhamId = table.Column<int>(type: "int", nullable: false),
                    NguoiDungId = table.Column<int>(type: "int", nullable: true),
                    SessionId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ThoiGianVao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ThoiGianRoi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThoiGianXemGiay = table.Column<int>(type: "int", nullable: false),
                    IPAddress = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuXemSanPham", x => x.LichSuId);
                    table.ForeignKey(
                        name: "FK_LichSuXemSanPham_NguoiDung_NguoiDungId",
                        column: x => x.NguoiDungId,
                        principalTable: "NguoiDung",
                        principalColumn: "NguoiDungId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LichSuXemSanPham_SanPham_SanPhamId",
                        column: x => x.SanPhamId,
                        principalTable: "SanPham",
                        principalColumn: "SanPhamId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LichSuXemSanPham_NguoiDungId",
                table: "LichSuXemSanPham",
                column: "NguoiDungId");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuXemSanPham_SanPhamId",
                table: "LichSuXemSanPham",
                column: "SanPhamId");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuXemSanPham_SanPhamId_ThoiGianVao",
                table: "LichSuXemSanPham",
                columns: new[] { "SanPhamId", "ThoiGianVao" });

            migrationBuilder.CreateIndex(
                name: "IX_LichSuXemSanPham_ThoiGianVao",
                table: "LichSuXemSanPham",
                column: "ThoiGianVao");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LichSuXemSanPham");
        }
    }
}
