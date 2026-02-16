import { listEmails } from "@/lib/api";
import { EmailList } from "./components/email-list";
import { Pagination } from "./components/pagination";
import { Inbox, ArrowDownLeft, ArrowUpRight, Mail } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    direction?: string;
    search?: string;
  }>;
}

export default async function InboxPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const direction = params.direction || "all";
  const search = params.search;

  let result;
  let error: string | null = null;

  try {
    result = await listEmails({ page, limit: 20, direction, search });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load emails";
  }

  const filterTabs = [
    { value: "all", label: "All", icon: Mail },
    { value: "inbound", label: "Inbound", icon: ArrowDownLeft },
    { value: "outbound", label: "Outbound", icon: ArrowUpRight },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Inbox className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Inbox</h2>
          {result && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {result.total}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {filterTabs.map((tab) => {
            const isActive = direction === tab.value;
            const href =
              tab.value === "all" ? "/" : `/?direction=${tab.value}`;

            return (
              <a
                key={tab.value}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Make sure the API server is running on{" "}
              {process.env.INTERNAL_API_URL || "http://localhost:8080"}
            </p>
          </div>
        ) : result ? (
          <>
            <EmailList emails={result.items} />
            <Pagination
              currentPage={result.page}
              totalPages={result.totalPages}
              basePath="/"
              searchParams={
                direction !== "all" ? { direction } : {}
              }
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
