import { NextResponse } from "next/server";

export function generateStaticParams() {
  return [{ filename: "placeholder.pdf" }];
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
