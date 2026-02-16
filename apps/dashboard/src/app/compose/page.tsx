"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "error";

interface AttachmentFile {
  file: File;
  base64: string;
}

export default function ComposePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [replyTo, setReplyTo] = useState("");
  const [showReplyTo, setShowReplyTo] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const canSend =
    from.trim() && to.trim() && subject.trim() && status !== "sending";

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data URL prefix to get raw base64
        const base64 = result.split(",")[1] || result;
        setAttachments((prev) => [...prev, { file, base64 }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSend() {
    setStatus("sending");
    setError("");

    try {
      const payload: Record<string, unknown> = {
        from: from.trim(),
        to: to.trim(),
        subject: subject.trim(),
      };

      if (isHtml) {
        payload.html = body;
      } else {
        payload.text = body;
      }

      if (replyTo.trim()) {
        payload.replyTo = replyTo.trim();
      }

      if (attachments.length > 0) {
        payload.attachments = attachments.map((a) => ({
          filename: a.file.name,
          content: a.base64,
          contentType: a.file.type || "application/octet-stream",
        }));
      }

      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Failed to send");
      }

      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h2 className="text-lg font-semibold">Email Sent</h2>
        <p className="text-sm text-muted-foreground">
          Your email has been delivered to Resend for processing.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            Go to Inbox
          </button>
          <button
            onClick={() => {
              setStatus("idle");
              setFrom("");
              setTo("");
              setSubject("");
              setBody("");
              setReplyTo("");
              setAttachments([]);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-colors hover:opacity-90"
          >
            Compose Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <Send className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Compose</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Attach files"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              canSend
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {status === "sending" ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {status === "error" && (
        <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-6 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl divide-y divide-border">
          {/* From */}
          <div className="flex items-center gap-3 px-6 py-3">
            <label className="w-16 shrink-0 text-sm text-muted-foreground">
              From
            </label>
            <input
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* To */}
          <div className="flex items-center gap-3 px-6 py-3">
            <label className="w-16 shrink-0 text-sm text-muted-foreground">
              To
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com (comma-separated for multiple)"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
            {!showReplyTo && (
              <button
                onClick={() => setShowReplyTo(true)}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Reply-To
              </button>
            )}
          </div>

          {/* Reply-To (optional) */}
          {showReplyTo && (
            <div className="flex items-center gap-3 px-6 py-3">
              <label className="w-16 shrink-0 text-sm text-muted-foreground">
                Reply-To
              </label>
              <input
                type="email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="replies@example.com"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
              <button
                onClick={() => {
                  setShowReplyTo(false);
                  setReplyTo("");
                }}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center gap-3 px-6 py-3">
            <label className="w-16 shrink-0 text-sm text-muted-foreground">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div className="px-6 py-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {attachments.length} file{attachments.length !== 1 ? "s" : ""}{" "}
                attached
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((a, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs"
                  >
                    <File className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{a.file.name}</p>
                      <p className="text-muted-foreground">
                        {formatSize(a.file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="ml-1 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body mode toggle */}
          <div className="flex items-center gap-3 px-6 py-2">
            <span className="w-16 shrink-0 text-sm text-muted-foreground">
              Body
            </span>
            <div className="flex items-center gap-1 rounded-md bg-muted p-0.5">
              <button
                onClick={() => setIsHtml(false)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  !isHtml
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                Plain Text
              </button>
              <button
                onClick={() => setIsHtml(true)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  isHtml
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                HTML
              </button>
            </div>
          </div>

          {/* Body textarea */}
          <div className="px-6 py-3">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                isHtml
                  ? "<p>Write your HTML email content here...</p>"
                  : "Write your message here..."
              }
              rows={16}
              className={cn(
                "w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/50",
                isHtml && "font-mono text-xs",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
