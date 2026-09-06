const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Connecting to MySQL server at 127.0.0.1:3306...");
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      port: Number(process.env.MYSQL_PORT) || 3306,
      multipleStatements: true,
    });

    console.log("Connected to MySQL successfully!");

    const sqlPath = path.join(__dirname, "..", "schema.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    console.log("Executing schema.sql...");
    await connection.query(sqlContent);
    console.log("SUCCESS! Database 'it_festival' and tables 'sponsors' & 'media_partners' have been created!");

    await connection.end();
  } catch (err) {
    console.error("ERROR connecting to MySQL:", err.message);
    process.exit(1);
  }
}

main();
