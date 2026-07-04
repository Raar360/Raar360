import { NextResponse } from "next/server";
import { loadLibraryFromDisk } from "@/lib/story/server-loader";

export async function GET() {
  try {
    const library = await loadLibraryFromDisk();
    return NextResponse.json(library);
  } catch (error) {
    console.error("Failed to load library:", error);
    return NextResponse.json({ error: "Failed to load library" }, { status: 500 });
  }
}
