import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results: Record<string, { status: string; count?: number; error?: string }> = {};

    const tables = ["sponsors", "media_partners", "timeline", "events", "speakers"];

    for (const table of tables) {
      const { data, count, error } = await supabase
        .from(table)
        .select("*", { count: "exact" });

      if (error) {
        results[table] = { status: "error", error: error.message };
      } else {
        results[table] = { status: "ok", count: count ?? data?.length ?? 0 };
      }
    }

    const allOk = Object.values(results).every((r) => r.status === "ok");

    return NextResponse.json({
      success: allOk,
      message: allOk
        ? "Semua tabel Supabase terhubung dengan baik!"
        : "Beberapa tabel belum siap. Silakan jalankan file supabase_schema.sql di Supabase SQL Editor.",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tables: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error checking Supabase",
      },
      { status: 500 }
    );
  }
}
