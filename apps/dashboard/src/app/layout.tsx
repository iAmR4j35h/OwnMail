import type { Metadata } from "next";
import { Sidebar } from "./components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resend Email Gateway",
  description: "Self-hostable email gateway powered by Resend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
