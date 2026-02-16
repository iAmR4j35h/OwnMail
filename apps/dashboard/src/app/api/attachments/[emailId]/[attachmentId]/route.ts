import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:8080";
const API_KEY = process.env.API_KEY || "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ emailId: string; attachmentId: string }> },
) {
  const { emailId, attachmentId } = await params;

  try {
    const res = await fetch(
      `${API_URL}/api/inbox/${emailId}/attachments/${attachmentId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: "Download failed" } }));
      return NextResponse.json(
        { success: false, error: error.error?.message || "Download failed" },
        { status: res.status },
      );
    }

    const contentType = res.headers.get("Content-Type") || "application/octet-stream";
    const contentDisposition = res.headers.get("Content-Disposition") || "";

    const body = await res.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to download attachment",
      },
      { status: 502 },
    );
  }
}
