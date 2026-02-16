import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { from, to, subject, html, text, replyTo, attachments } = body;

    if (!from || !to || !subject) {
      return NextResponse.json(
        { success: false, error: "from, to, and subject are required" },
        { status: 400 },
      );
    }

    // Convert comma-separated "to" into array
    const toList =
      typeof to === "string"
        ? to
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : to;

    const result = await sendEmail({
      from,
      to: toList.length === 1 ? toList[0] : toList,
      subject,
      html: html || undefined,
      text: text || undefined,
      replyTo: replyTo || undefined,
      attachments: attachments?.length ? attachments : undefined,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 },
    );
  }
}
