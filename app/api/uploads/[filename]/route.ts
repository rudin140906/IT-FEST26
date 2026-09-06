import { NextResponse } from "next/server";

export function generateStaticParams() {
  return [{ filename: "placeholder.png" }];
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
