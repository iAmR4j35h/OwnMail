import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "verified" | "pending" | "failed" | "not_started" | "ok" | "degraded" | "error";
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-success/10 text-success" },
  ok: { label: "Healthy", className: "bg-success/10 text-success" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  degraded: { label: "Degraded", className: "bg-warning/10 text-warning" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
  error: { label: "Error", className: "bg-destructive/10 text-destructive" },
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
