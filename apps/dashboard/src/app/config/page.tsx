import { getConfigStatus, getHealth } from "@/lib/api";
import { StatusBadge } from "../components/status-badge";
import {
  Settings,
  Globe,
  Database,
  Webhook,
  Activity,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

export default async function ConfigPage() {
  let config;
  let health;
  let error: string | null = null;

  try {
    [config, health] = await Promise.all([getConfigStatus(), getHealth()]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load configuration";
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Configuration</h2>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Make sure the API server is running.
            </p>
          </div>
        ) : config && health ? (
          <div className="mx-auto max-w-3xl space-y-6">
            {/* System Status */}
            <section className="rounded-lg border border-border">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">System Status</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-5">
                <div>
                  <p className="text-xs text-muted-foreground">Health</p>
                  <StatusBadge status={health.status} className="mt-1" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Version</p>
                  <p className="mt-1 text-sm font-mono">{health.version}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="mt-1 text-sm">{formatUptime(health.uptime)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="mt-1 text-sm capitalize">{health.storage}</p>
                </div>
              </div>
            </section>

            {/* Resend Connection */}
            <section className="rounded-lg border border-border">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Resend Connection</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-5">
                <div>
                  <p className="text-xs text-muted-foreground">API Connected</p>
                  <StatusBadge
                    status={config.resendConnected ? "verified" : "failed"}
                    className="mt-1"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Webhook</p>
                  <StatusBadge
                    status={config.webhookConfigured ? "verified" : "pending"}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            {/* Domain Status */}
            {config.domain && (
              <section className="rounded-lg border border-border">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">{config.domain.name}</h3>
                  </div>
                  <StatusBadge status={config.domain.status} />
                </div>
                {config.domain.records.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="px-5 py-2 text-left font-medium">Type</th>
                          <th className="px-5 py-2 text-left font-medium">Name</th>
                          <th className="px-5 py-2 text-left font-medium">Value</th>
                          <th className="px-5 py-2 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.domain.records.map((record, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="px-5 py-2 font-mono">{record.type}</td>
                            <td className="px-5 py-2 font-mono">{record.name}</td>
                            <td className="max-w-xs truncate px-5 py-2 font-mono">
                              {record.value}
                            </td>
                            <td className="px-5 py-2">
                              <StatusBadge status={record.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* Email Stats */}
            <section className="rounded-lg border border-border">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Email Statistics</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 p-5">
                <div className="text-center">
                  <p className="text-2xl font-bold">{config.stats.totalEmails}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowDownLeft className="h-3 w-3 text-inbound" />
                    <p className="text-2xl font-bold">{config.stats.inboundCount}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Inbound</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-outbound" />
                    <p className="text-2xl font-bold">{config.stats.outboundCount}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Outbound</p>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}
