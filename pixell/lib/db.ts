import mysql from "mysql2/promise";

export interface PartnerItem {
  id: number;
  name: string;
  logo_url: string;
  type: "sponsor" | "media_partner";
  website_url?: string;
}

// Create connection pool with fallback settings
export const dbPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "it_festival",
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function fetchPartnersFromDB(type?: "sponsor" | "media_partner"): Promise<PartnerItem[] | null> {
  try {
    let query = "SELECT id, name, logo_url, type, website_url FROM partners";
    const params: string[] = [];

    if (type) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY id DESC";

    const [rows] = await dbPool.query(query, params);
    return rows as PartnerItem[];
  } catch (error) {
    // If MySQL is not running or env is not set, log gracefully and return null
    console.warn("MySQL database fetch fallback:", (error as Error).message);
    return null;
  }
}
