import mysql from "mysql2/promise";

export interface SponsorItem {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
  created_at?: string;
  is_visible?: number;
}

export interface MediaPartnerItem {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
  created_at?: string;
  is_visible?: number;
}

export interface PartnerItem {
  id: number;
  name: string;
  logo_url: string;
  type: "sponsor" | "media_partner";
  website_url?: string;
  is_visible?: number;
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

const visibilityColumnCache = new Map<"sponsors" | "media_partners", boolean>();

async function hasVisibilityColumn(table: "sponsors" | "media_partners"): Promise<boolean> {
  if (visibilityColumnCache.has(table)) {
    return visibilityColumnCache.get(table) ?? false;
  }

  try {
    const [rows] = await dbPool.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'is_visible'`);
    const exists = Array.isArray(rows) && rows.length > 0;
    if (!exists) {
      try {
        await dbPool.query(
          `ALTER TABLE \`${table}\` ADD COLUMN is_visible TINYINT(1) NOT NULL DEFAULT 1 AFTER website_url`
        );
        visibilityColumnCache.set(table, true);
        return true;
      } catch {
        visibilityColumnCache.set(table, false);
        return false;
      }
    }
    visibilityColumnCache.set(table, exists);
    return exists;
  } catch {
    return false;
  }
}

// ===================================================
// SPONSORS DATABASE OPERATIONS
// ===================================================
export async function fetchSponsorsFromDB(): Promise<SponsorItem[] | null> {
  try {
    const includeVisibility = await hasVisibilityColumn("sponsors");
    const selectFields = includeVisibility
      ? "id, name, logo_url, website_url, created_at, is_visible"
      : "id, name, logo_url, website_url, created_at";
    const [rows] = await dbPool.query(`SELECT ${selectFields} FROM sponsors ORDER BY id DESC`);
    return rows as SponsorItem[];
  } catch {
    return null;
  }
}

export async function insertSponsorToDB(sponsor: {
  name: string;
  logo_url: string;
  website_url?: string;
  is_visible?: number;
}): Promise<number | null> {
  try {
    const includeVisibility = await hasVisibilityColumn("sponsors");
    if (includeVisibility) {
      const [result] = await dbPool.query(
        "INSERT INTO sponsors (name, logo_url, website_url, is_visible) VALUES (?, ?, ?, ?)",
        [sponsor.name, sponsor.logo_url, sponsor.website_url || null, sponsor.is_visible ?? 1]
      );
      return (result as { insertId?: number }).insertId || null;
    }

    const [result] = await dbPool.query(
      "INSERT INTO sponsors (name, logo_url, website_url) VALUES (?, ?, ?)",
      [sponsor.name, sponsor.logo_url, sponsor.website_url || null]
    );
    return (result as { insertId?: number }).insertId || null;
  } catch (error) {
    console.warn("MySQL insert sponsor error:", (error as Error).message);
    return null;
  }
}

export async function updateSponsorInDB(
  id: number,
  sponsor: {
    name?: string;
    logo_url?: string;
    website_url?: string;
    is_visible?: number;
  }
): Promise<boolean> {
  try {
    const includeVisibility = await hasVisibilityColumn("sponsors");
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (sponsor.name !== undefined) {
      fields.push("name = ?");
      values.push(sponsor.name);
    }
    if (sponsor.logo_url !== undefined) {
      fields.push("logo_url = ?");
      values.push(sponsor.logo_url);
    }
    if (sponsor.website_url !== undefined) {
      fields.push("website_url = ?");
      values.push(sponsor.website_url || null);
    }
    if (includeVisibility && sponsor.is_visible !== undefined) {
      fields.push("is_visible = ?");
      values.push(sponsor.is_visible);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await dbPool.query(`UPDATE sponsors SET ${fields.join(", ")} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.warn("MySQL update sponsor error:", (error as Error).message);
    return false;
  }
}

export async function deleteSponsorFromDB(id: number): Promise<boolean> {
  try {
    await dbPool.query("DELETE FROM sponsors WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.warn("MySQL delete sponsor error:", (error as Error).message);
    return false;
  }
}

// ===================================================
// MEDIA PARTNERS DATABASE OPERATIONS
// ===================================================
export async function fetchMediaPartnersFromDB(): Promise<MediaPartnerItem[] | null> {
  try {
    const includeVisibility = await hasVisibilityColumn("media_partners");
    const selectFields = includeVisibility
      ? "id, name, logo_url, website_url, created_at, is_visible"
      : "id, name, logo_url, website_url, created_at";
    const [rows] = await dbPool.query(`SELECT ${selectFields} FROM media_partners ORDER BY id DESC`);
    return rows as MediaPartnerItem[];
  } catch {
    return null;
  }
}

export async function insertMediaPartnerToDB(partner: {
  name: string;
  logo_url: string;
  website_url?: string;
  is_visible?: number;
}): Promise<number | null> {
  try {
    const includeVisibility = await hasVisibilityColumn("media_partners");
    if (includeVisibility) {
      const [result] = await dbPool.query(
        "INSERT INTO media_partners (name, logo_url, website_url, is_visible) VALUES (?, ?, ?, ?)",
        [partner.name, partner.logo_url, partner.website_url || null, partner.is_visible ?? 1]
      );
      return (result as { insertId?: number }).insertId || null;
    }

    const [result] = await dbPool.query(
      "INSERT INTO media_partners (name, logo_url, website_url) VALUES (?, ?, ?)",
      [partner.name, partner.logo_url, partner.website_url || null]
    );
    return (result as { insertId?: number }).insertId || null;
  } catch (error) {
    console.warn("MySQL insert media partner error:", (error as Error).message);
    return null;
  }
}

export async function updateMediaPartnerInDB(
  id: number,
  partner: {
    name?: string;
    logo_url?: string;
    website_url?: string;
    is_visible?: number;
  }
): Promise<boolean> {
  try {
    const includeVisibility = await hasVisibilityColumn("media_partners");
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
    if (partner.website_url !== undefined) {
      fields.push("website_url = ?");
      values.push(partner.website_url || null);
    }
    if (includeVisibility && partner.is_visible !== undefined) {
      fields.push("is_visible = ?");
      values.push(partner.is_visible);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await dbPool.query(`UPDATE media_partners SET ${fields.join(", ")} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.warn("MySQL update media partner error:", (error as Error).message);
    return false;
  }
}

export async function deleteMediaPartnerFromDB(id: number): Promise<boolean> {
  try {
    await dbPool.query("DELETE FROM media_partners WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.warn("MySQL delete media partner error:", (error as Error).message);
    return false;
  }
}

// ===================================================
// TIMELINE DATABASE OPERATIONS
// ===================================================
export interface TimelineDBItem {
  id: number;
  title: string;
  date_string: string;
  category?: string;
  badge_color?: string;
  image_url?: string;
  created_at?: string;
}

export async function fetchTimelineFromDB(): Promise<TimelineDBItem[] | null> {
  try {
    const [rows] = await dbPool.query(
      "SELECT id, title, date_string, category, badge_color, image_url, created_at FROM timeline ORDER BY id ASC"
    );
    return rows as TimelineDBItem[];
  } catch {
    return null;
  }
}

export async function insertTimelineToDB(item: {
  title: string;
  date_string: string;
  category?: string;
  badge_color?: string;
  image_url?: string;
}): Promise<number | null> {
  try {
    const [result] = await dbPool.query(
      "INSERT INTO timeline (title, date_string, category, badge_color, image_url) VALUES (?, ?, ?, ?, ?)",
      [item.title, item.date_string, item.category || "AGENDA", item.badge_color || "pink", item.image_url || null]
    );
    return (result as { insertId?: number }).insertId || null;
  } catch (error) {
    console.warn("MySQL insert timeline error:", (error as Error).message);
    return null;
  }
}

export async function updateTimelineInDB(
  id: number,
  item: {
    title?: string;
    date_string?: string;
    category?: string;
    badge_color?: string;
    image_url?: string;
  }
): Promise<boolean> {
  try {
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (item.title !== undefined) {
      fields.push("title = ?");
      values.push(item.title);
    }
    if (item.date_string !== undefined) {
      fields.push("date_string = ?");
      values.push(item.date_string);
    }
    if (item.category !== undefined) {
      fields.push("category = ?");
      values.push(item.category);
    }
    if (item.badge_color !== undefined) {
      fields.push("badge_color = ?");
      values.push(item.badge_color);
    }
    if (item.image_url !== undefined) {
      fields.push("image_url = ?");
      values.push(item.image_url || null);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await dbPool.query(`UPDATE timeline SET ${fields.join(", ")} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.warn("MySQL update timeline error:", (error as Error).message);
    return false;
  }
}

export async function deleteTimelineFromDB(id: number): Promise<boolean> {
  try {
    await dbPool.query("DELETE FROM timeline WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.warn("MySQL delete timeline error:", (error as Error).message);
    return false;
  }
}

// ===================================================
// EVENTS DATABASE OPERATIONS
// ===================================================
export interface EventDBItem {
  id: string;
  title: string;
  category: string;
  category_label: string;
  description: string;
  icon_type: string;
  badge_color: string;
  gform_url: string;
  guidebook_url: string;
  mascot_url?: string;
}

export async function fetchEventsFromDB(): Promise<EventDBItem[] | null> {
  try {
    const [rows] = await dbPool.query(
      "SELECT id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url FROM events ORDER BY id ASC"
    );
    return rows as EventDBItem[];
  } catch {
    return null;
  }
}

export async function updateEventInDB(
  id: string,
  event: Partial<Pick<EventDBItem, "gform_url" | "guidebook_url" | "mascot_url" | "title" | "description">>
): Promise<boolean> {
  try {
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (event.gform_url !== undefined) {
      fields.push("gform_url = ?");
      values.push(event.gform_url);
    }
    if (event.guidebook_url !== undefined) {
      fields.push("guidebook_url = ?");
      values.push(event.guidebook_url);
    }
    if (event.mascot_url !== undefined) {
      fields.push("mascot_url = ?");
      values.push(event.mascot_url || null);
    }
    if (event.title !== undefined) {
      fields.push("title = ?");
      values.push(event.title);
    }
    if (event.description !== undefined) {
      fields.push("description = ?");
      values.push(event.description);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await dbPool.query(`UPDATE events SET ${fields.join(", ")} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.warn("MySQL update event error:", (error as Error).message);
    return false;
  }
}

// ===================================================
// SPEAKERS DATABASE OPERATIONS
// ===================================================
export interface SpeakerDBItem {
  id: string;
  name: string;
  role: string;
  category: "guest-star" | "speaker";
  photo?: string;
  photo_position?: string;
  cv?: string;
  color: "yellow" | "pink" | "cyan";
  created_at?: string;
}

export async function fetchSpeakersFromDB(): Promise<SpeakerDBItem[] | null> {
  try {
    const [rows] = await dbPool.query(
      "SELECT id, name, role, category, photo, photo_position, cv, color, created_at FROM speakers ORDER BY id ASC"
    );
    return rows as SpeakerDBItem[];
  } catch {
    return null;
  }
}

export async function insertSpeakerToDB(speaker: {
  id: string;
  name: string;
  role: string;
  category: "guest-star" | "speaker";
  photo?: string;
  photo_position?: string;
  cv?: string;
  color?: "yellow" | "pink" | "cyan";
}): Promise<boolean> {
  try {
    await dbPool.query(
      "INSERT INTO speakers (id, name, role, category, photo, photo_position, cv, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        speaker.id,
        speaker.name,
        speaker.role,
        speaker.category,
        speaker.photo || null,
        speaker.photo_position || "center",
        speaker.cv || null,
        speaker.color || "pink",
      ]
    );
    return true;
  } catch (error) {
    console.warn("MySQL insert speaker error:", (error as Error).message);
    return false;
  }
}

export async function updateSpeakerInDB(
  id: string,
  speaker: Partial<Omit<SpeakerDBItem, "id">>
): Promise<boolean> {
  try {
    const fields: string[] = [];
    const values: (string | null)[] = [];

    if (speaker.name !== undefined) {
      fields.push("name = ?");
      values.push(speaker.name);
    }
    if (speaker.role !== undefined) {
      fields.push("role = ?");
      values.push(speaker.role);
    }
    if (speaker.category !== undefined) {
      fields.push("category = ?");
      values.push(speaker.category);
    }
    if (speaker.photo !== undefined) {
      fields.push("photo = ?");
      values.push(speaker.photo || null);
    }
    if (speaker.photo_position !== undefined) {
      fields.push("photo_position = ?");
      values.push(speaker.photo_position);
    }
    if (speaker.cv !== undefined) {
      fields.push("cv = ?");
      values.push(speaker.cv || null);
    }
    if (speaker.color !== undefined) {
      fields.push("color = ?");
      values.push(speaker.color);
    }

    if (fields.length === 0) return true;

    values.push(id);
    await dbPool.query(`UPDATE speakers SET ${fields.join(", ")} WHERE id = ?`, values);
    return true;
  } catch (error) {
    console.warn("MySQL update speaker error:", (error as Error).message);
    return false;
  }
}

export async function deleteSpeakerFromDB(id: string): Promise<boolean> {
  try {
    await dbPool.query("DELETE FROM speakers WHERE id = ?", [id]);
    return true;
  } catch (error) {
    console.warn("MySQL delete speaker error:", (error as Error).message);
    return false;
  }
}
