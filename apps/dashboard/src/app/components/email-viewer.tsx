import type { StoredEmail } from "@resend-gateway/types";
import { formatDate } from "@/lib/utils";
import { getAttachmentDownloadUrl } from "@/lib/api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Tag,
  Paperclip,
  Download,
  FileText,
  Image,
  File,
} from "lucide-react";

interface EmailViewerProps {
  email: StoredEmail;
}

function AttachmentIcon({ contentType }: { contentType: string }) {
  if (contentType.startsWith("image/"))
    return <Image className="h-4 w-4 text-muted-foreground" />;
  if (
    contentType === "application/pdf" ||
    contentType.startsWith("text/")
  )
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EmailViewer({ email }: EmailViewerProps) {
  const toList = Array.isArray(email.to) ? email.to : [email.to];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="border-b border-border px-6 py-6">
        <div className="mb-4 flex items-start justify-between">
          <h1 className="text-xl font-semibold">
            {email.subject || "(no subject)"}
          </h1>
          <div className="flex items-center gap-2">
            {email.direction === "inbound" ? (
              <ArrowDownLeft className="h-4 w-4 text-inbound" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-outbound" />
            )}
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {email.direction}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-muted-foreground">From</span>
            <span className="font-medium">{email.from}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-muted-foreground">To</span>
            <span>{toList.join(", ")}</span>
          </div>
          {email.replyTo && (
            <div className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-muted-foreground">
                Reply
              </span>
              <span>{email.replyTo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">
              {new Date(email.createdAt).toLocaleString()}
            </span>
          </div>
          {email.resendId && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span className="font-mono text-xs">{email.resendId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="border-b border-border px-6 py-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            {email.attachments.length} attachment
            {email.attachments.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={getAttachmentDownloadUrl(email.id, attachment.id)}
                download={attachment.filename}
                className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-muted"
              >
                <AttachmentIcon contentType={attachment.contentType} />
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {attachment.filename}
                  </p>
                  {attachment.size && (
                    <p className="text-muted-foreground">
                      {formatSize(attachment.size)}
                    </p>
                  )}
                </div>
                <Download className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-6">
        {email.html ? (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: email.html }}
          />
        ) : email.text ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {email.text}
          </pre>
        ) : (
          <p className="italic text-muted-foreground">No content</p>
        )}
      </div>

      {/* Headers (collapsible) */}
      {email.headers && Object.keys(email.headers).length > 0 && (
        <details className="border-t border-border px-6 py-4">
          <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
            Raw Headers ({Object.keys(email.headers).length})
          </summary>
          <div className="mt-3 space-y-1">
            {Object.entries(email.headers).map(([key, value]) => (
              <div key={key} className="flex gap-2 font-mono text-xs">
                <span className="shrink-0 text-muted-foreground">
                  {key}:
                </span>
                <span className="break-all">{value}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
