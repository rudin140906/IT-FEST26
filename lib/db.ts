import { supabase } from "@/lib/supabase";

export interface SponsorItem {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
  created_at?: string;
  is_visible?: number | boolean;
}

export interface MediaPartnerItem {
  id: number;
  name: string;
  logo_url: string;
  website_url?: string;
  created_at?: string;
  is_visible?: number | boolean;
}

export interface PartnerItem {
  id: number;
  name: string;
  logo_url: string;
  type: "sponsor" | "media_partner";
  website_url?: string;
  is_visible?: number | boolean;
}

// ===================================================
// SPONSORS SUPABASE OPERATIONS
// ===================================================
export async function fetchSponsorsFromDB(): Promise<SponsorItem[] | null> {
  try {
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, logo_url, website_url, is_visible, created_at")
      .order("id", { ascending: true });

    if (error) {
      console.warn("Supabase fetch sponsors error:", error.message);
      return null;
    }

    return (data || []).map((item) => ({
      ...item,
      is_visible: item.is_visible ? 1 : 0,
    })) as SponsorItem[];
  } catch (err: any) {
    console.warn("Supabase fetch sponsors exception:", err?.message);
    return null;
  }
}

export async function insertSponsorToDB(sponsor: {
  name: string;
  logo_url: string;
  website_url?: string;
  is_visible?: number | boolean;
}): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("sponsors")
      .insert({
        name: sponsor.name,
        logo_url: sponsor.logo_url,
        website_url: sponsor.website_url || null,
        is_visible: sponsor.is_visible !== undefined ? Boolean(sponsor.is_visible) : true,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.warn("Supabase insert sponsor error:", error?.message);
      return null;
    }
    return Number(data.id);
  } catch (err: any) {
    console.warn("Supabase insert sponsor exception:", err?.message);
    return null;
  }
}

export async function updateSponsorInDB(
  id: number,
  sponsor: {
    name?: string;
    logo_url?: string;
    website_url?: string;
    is_visible?: number | boolean;
  }
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {};
    if (sponsor.name !== undefined) updatePayload.name = sponsor.name;
    if (sponsor.logo_url !== undefined) updatePayload.logo_url = sponsor.logo_url;
    if (sponsor.website_url !== undefined) updatePayload.website_url = sponsor.website_url || null;
    if (sponsor.is_visible !== undefined) updatePayload.is_visible = Boolean(sponsor.is_visible);

    if (Object.keys(updatePayload).length === 0) return true;

    const { data, error } = await supabase
      .from("sponsors")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.warn("Supabase update sponsor error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase update sponsor exception:", err?.message);
    return false;
  }
}

export async function deleteSponsorFromDB(id: number, name?: string): Promise<boolean> {
  try {
    let query = supabase.from("sponsors").delete();
    if (name) {
      query = query.or(`id.eq.${id},name.ilike.${name}`);
    } else {
      query = query.eq("id", id);
    }
    const { data, error } = await query.select();
    if (error) {
      console.warn("Supabase delete sponsor error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase delete sponsor exception:", err?.message);
    return false;
  }
}

// ===================================================
// MEDIA PARTNERS SUPABASE OPERATIONS
// ===================================================
export async function fetchMediaPartnersFromDB(): Promise<MediaPartnerItem[] | null> {
  try {
    const { data, error } = await supabase
      .from("media_partners")
      .select("id, name, logo_url, website_url, is_visible, created_at")
      .order("id", { ascending: true });

    if (error) {
      console.warn("Supabase fetch media partners error:", error.message);
      return null;
    }

    return (data || []).map((item) => ({
      ...item,
      is_visible: item.is_visible ? 1 : 0,
    })) as MediaPartnerItem[];
  } catch (err: any) {
    console.warn("Supabase fetch media partners exception:", err?.message);
    return null;
  }
}

export async function insertMediaPartnerToDB(partner: {
  name: string;
  logo_url: string;
  website_url?: string;
  is_visible?: number | boolean;
}): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("media_partners")
      .insert({
        name: partner.name,
        logo_url: partner.logo_url,
        website_url: partner.website_url || null,
        is_visible: partner.is_visible !== undefined ? Boolean(partner.is_visible) : true,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.warn("Supabase insert media partner error:", error?.message);
      return null;
    }
    return Number(data.id);
  } catch (err: any) {
    console.warn("Supabase insert media partner exception:", err?.message);
    return null;
  }
}

export async function updateMediaPartnerInDB(
  id: number,
  partner: {
    name?: string;
    logo_url?: string;
    website_url?: string;
    is_visible?: number | boolean;
  }
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {};
    if (partner.name !== undefined) updatePayload.name = partner.name;
    if (partner.logo_url !== undefined) updatePayload.logo_url = partner.logo_url;
    if (partner.website_url !== undefined) updatePayload.website_url = partner.website_url || null;
    if (partner.is_visible !== undefined) updatePayload.is_visible = Boolean(partner.is_visible);

    if (Object.keys(updatePayload).length === 0) return true;

    const { data, error } = await supabase
      .from("media_partners")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.warn("Supabase update media partner error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase update media partner exception:", err?.message);
    return false;
  }
}

export async function deleteMediaPartnerFromDB(id: number, name?: string): Promise<boolean> {
  try {
    let query = supabase.from("media_partners").delete();
    if (name) {
      query = query.or(`id.eq.${id},name.ilike.${name}`);
    } else {
      query = query.eq("id", id);
    }
    const { data, error } = await query.select();
    if (error) {
      console.warn("Supabase delete media partner error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase delete media partner exception:", err?.message);
    return false;
  }
}

// ===================================================
// TIMELINE SUPABASE OPERATIONS
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
    const { data, error } = await supabase
      .from("timeline")
      .select("id, title, date_string, category, badge_color, image_url, created_at")
      .order("id", { ascending: true });

    if (error || !data) {
      console.warn("Supabase fetch timeline error:", error?.message);
      return null;
    }

    return data as TimelineDBItem[];
  } catch (err: any) {
    console.warn("Supabase fetch timeline exception:", err?.message);
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
    const { data, error } = await supabase
      .from("timeline")
      .insert({
        title: item.title,
        date_string: item.date_string,
        category: item.category || "AGENDA",
        badge_color: item.badge_color || "pink",
        image_url: item.image_url || null,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.warn("Supabase insert timeline error:", error?.message);
      return null;
    }
    return Number(data.id);
  } catch (err: any) {
    console.warn("Supabase insert timeline exception:", err?.message);
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
    const updatePayload: Record<string, any> = {};
    if (item.title !== undefined) updatePayload.title = item.title;
    if (item.date_string !== undefined) updatePayload.date_string = item.date_string;
    if (item.category !== undefined) updatePayload.category = item.category;
    if (item.badge_color !== undefined) updatePayload.badge_color = item.badge_color;
    if (item.image_url !== undefined) updatePayload.image_url = item.image_url || null;

    if (Object.keys(updatePayload).length === 0) return true;

    const { data, error } = await supabase
      .from("timeline")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.warn("Supabase update timeline error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase update timeline exception:", err?.message);
    return false;
  }
}

export async function deleteTimelineFromDB(id: number): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("timeline").delete().eq("id", id).select();
    if (error) {
      console.warn("Supabase delete timeline error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase delete timeline exception:", err?.message);
    return false;
  }
}

// ===================================================
// EVENTS SUPABASE OPERATIONS
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
    const { data, error } = await supabase
      .from("events")
      .select("id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url")
      .order("id", { ascending: true });

    if (error || !data) {
      console.warn("Supabase fetch events error:", error?.message);
      return null;
    }

    return data as EventDBItem[];
  } catch (err: any) {
    console.warn("Supabase fetch events exception:", err?.message);
    return null;
  }
}

export async function updateEventInDB(
  id: string,
  event: Partial<Pick<EventDBItem, "gform_url" | "guidebook_url" | "mascot_url" | "title" | "description">>
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {};
    if (event.gform_url !== undefined) updatePayload.gform_url = event.gform_url;
    if (event.guidebook_url !== undefined) updatePayload.guidebook_url = event.guidebook_url;
    if (event.mascot_url !== undefined) updatePayload.mascot_url = event.mascot_url || null;
    if (event.title !== undefined) updatePayload.title = event.title;
    if (event.description !== undefined) updatePayload.description = event.description;

    if (Object.keys(updatePayload).length === 0) return true;

    const { data, error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.warn("Supabase update event error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase update event exception:", err?.message);
    return false;
  }
}

// ===================================================
// SPEAKERS SUPABASE OPERATIONS
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
    const { data, error } = await supabase
      .from("speakers")
      .select("id, name, role, category, photo, photo_position, cv, color, created_at")
      .order("id", { ascending: true });

    if (error || !data) {
      console.warn("Supabase fetch speakers error:", error?.message);
      return null;
    }

    return data as SpeakerDBItem[];
  } catch (err: any) {
    console.warn("Supabase fetch speakers exception:", err?.message);
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
    const { error } = await supabase.from("speakers").insert({
      id: speaker.id,
      name: speaker.name,
      role: speaker.role,
      category: speaker.category,
      photo: speaker.photo || null,
      photo_position: speaker.photo_position || "center",
      cv: speaker.cv || null,
      color: speaker.color || "pink",
    });

    if (error) {
      console.warn("Supabase insert speaker error:", error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn("Supabase insert speaker exception:", err?.message);
    return false;
  }
}

export async function updateSpeakerInDB(
  id: string,
  speaker: Partial<Omit<SpeakerDBItem, "id">>
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {};
    if (speaker.name !== undefined) updatePayload.name = speaker.name;
    if (speaker.role !== undefined) updatePayload.role = speaker.role;
    if (speaker.category !== undefined) updatePayload.category = speaker.category;
    if (speaker.photo !== undefined) updatePayload.photo = speaker.photo || null;
    if (speaker.photo_position !== undefined) updatePayload.photo_position = speaker.photo_position;
    if (speaker.cv !== undefined) updatePayload.cv = speaker.cv || null;
    if (speaker.color !== undefined) updatePayload.color = speaker.color;

    if (Object.keys(updatePayload).length === 0) return true;

    const { data, error } = await supabase
      .from("speakers")
      .update(updatePayload)
      .eq("id", id)
      .select();

    if (error) {
      console.warn("Supabase update speaker error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase update speaker exception:", err?.message);
    return false;
  }
}

export async function deleteSpeakerFromDB(id: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("speakers").delete().eq("id", id).select();
    if (error) {
      console.warn("Supabase delete speaker error:", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch (err: any) {
    console.warn("Supabase delete speaker exception:", err?.message);
    return false;
  }
}
