import { NextResponse } from "next/server";
import { loadAssetManifest } from "@/lib/assets/loader";

export async function GET() {
  try {
    const manifest = await loadAssetManifest();
    return NextResponse.json(manifest);
  } catch {
    return NextResponse.json({ error: "Failed to load asset manifest" }, { status: 500 });
  }
}
