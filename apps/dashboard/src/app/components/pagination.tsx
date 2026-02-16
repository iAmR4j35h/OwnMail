"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between border-t border-border px-6 py-3">
      <p className="text-xs text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        {currentPage > 1 && (
          <Link
            href={pageHref(currentPage - 1)}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs hover:bg-muted"
          >
            <ChevronLeft className="h-3 w-3" />
            Prev
          </Link>
        )}
        {currentPage < totalPages && (
          <Link
            href={pageHref(currentPage + 1)}
            className="inline-flex items-center rounded-md px-2 py-1 text-xs hover:bg-muted"
          >
            Next
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
