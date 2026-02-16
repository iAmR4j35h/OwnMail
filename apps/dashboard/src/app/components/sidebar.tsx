"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Inbox, Settings, Activity, Mail, PenSquare } from "lucide-react";

const navItems = [
  { href: "/", label: "Inbox", icon: Inbox },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/config", label: "Configuration", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-muted/50">
      <div className="flex items-center gap-2 border-b border-border px-6 py-5">
        <Mail className="h-6 w-6 text-inbound" />
        <div>
          <h1 className="text-sm font-semibold">Resend Gateway</h1>
          <p className="text-xs text-muted-foreground">Email Infrastructure</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname.startsWith("/inbox")
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>v0.1.0</span>
        </div>
      </div>
    </aside>
  );
}
