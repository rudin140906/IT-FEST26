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
    console.warn("MySQL database fetch fallback:", (error as Error).message);
    return null;
  }
}

export async function insertPartnerToDB(partner: {
  name: string;
  logo_url: string;
  type: "sponsor" | "media_partner";
  website_url?: string;
}): Promise<number | null> {
  try {
    const [result] = await dbPool.query(
      "INSERT INTO partners (name, logo_url, type, website_url) VALUES (?, ?, ?, ?)",
      [partner.name, partner.logo_url, partner.type, partner.website_url || null]
    );
    return (result as { insertId?: number }).insertId || null;
  } catch (error) {
    console.warn("MySQL insert partner error:", (error as Error).message);
    return null;
  }
}

export async function updatePartnerInDB(
  id: number,
  partner: {
    name?: string;
    logo_url?: string;
    type?: "sponsor" | "media_partner";
    website_url?: string;
  }
): Promise<boolean> {
  try {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (partner.name !== undefined) {
      fields.push("name = ?");
      values.push(partner.name);
    }
    if (partner.logo_url !== undefined) {
      fields.push("logo_url = ?");
      values.push(partner.logo_url);
    }
    if (partner.type !== undefined) {
      fields.push("type = ?");
      values.push(partner.type);
    }
    if (partner.website_url !== undefined) {
      fields.push("website_url = ?");
      values.push(partner.website_url || null);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await dbPool.query(`UPDATE partners SET ${fields.join(", ")} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.warn("MySQL update partner error:", (error as Error).message);
    return false;
  }
}

export async function deletePartnerFromDB(id: number): Promise<boolean> {
  try {
    await dbPool.query("DELETE FROM partners WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.warn("MySQL delete partner error:", (error as Error).message);
    return false;
  }
}
