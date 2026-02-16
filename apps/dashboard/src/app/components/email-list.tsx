import Link from "next/link";
import type { EmailSummary } from "@resend-gateway/types";
import { cn, formatDate, truncate } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Paperclip } from "lucide-react";

interface EmailListProps {
  emails: EmailSummary[];
}

export function EmailList({ emails }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">No emails yet</p>
        <p className="text-sm">
          Send an email via the API or configure webhooks to receive inbound
          mail.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {emails.map((email) => (
        <Link
          key={email.id}
          href={`/inbox/${email.id}`}
          className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-muted/50"
        >
          <div className="mt-1 shrink-0">
            {email.direction === "inbound" ? (
              <ArrowDownLeft className="h-4 w-4 text-inbound" />
            ) : (
              <ArrowUpRight className="h-4 w-4 text-outbound" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <span className="truncate text-sm font-medium">
                {email.from}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(email.createdAt)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm">{email.subject || "(no subject)"}</p>
              {email.attachmentCount && email.attachmentCount > 0 && (
                <span className="inline-flex shrink-0 items-center gap-0.5 text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  <span className="text-[10px]">{email.attachmentCount}</span>
                </span>
              )}
            </div>

            {email.snippet && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {truncate(email.snippet, 100)}
              </p>
            )}
          </div>

          <span
            className={cn(
              "mt-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
              email.direction === "inbound"
                ? "bg-inbound/10 text-inbound"
                : "bg-outbound/10 text-outbound",
            )}
          >
            {email.direction}
          </span>
        </Link>
      ))}
    </div>
  );
}
