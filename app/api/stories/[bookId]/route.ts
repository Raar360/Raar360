import { NextResponse } from "next/server";
import { loadBookFromDisk } from "@/lib/story/server-loader";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  try {
    const { bookId } = await params;
    const book = await loadBookFromDisk(bookId);
    return NextResponse.json(book);
  } catch (error) {
    console.error("Failed to load book:", error);
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
}
