import { NextResponse } from "next/server";
import { loadAssetRegistry } from "@/lib/assets/registry";

export async function GET() {
  try {
    const registry = await loadAssetRegistry();
    return NextResponse.json(registry);
  } catch {
    return NextResponse.json({ error: "Failed to load asset registry" }, { status: 500 });
  }
}
