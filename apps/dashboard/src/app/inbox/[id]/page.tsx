import { getEmail } from "@/lib/api";
import { EmailViewer } from "../../components/email-viewer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmailDetailPage({ params }: PageProps) {
  const { id } = await params;

  let email;
  try {
    email = await getEmail(id);
  } catch {
    notFound();
  }

  if (!email) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        <EmailViewer email={email} />
      </div>
    </div>
  );
}
