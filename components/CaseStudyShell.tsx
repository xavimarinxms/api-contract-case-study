import Link from "next/link";

/**
 * Shared shell for case study pages: back link + header.
 * Reuse it in every `app/<slug>/page.tsx`.
 */
export default function CaseStudyShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link
        href="/"
        className="text-sm text-neutral-500 hover:text-neutral-900 hover:underline underline-offset-4"
      >
        ← Back to case studies
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
      {intro ? (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-neutral-600">
          {intro}
        </div>
      ) : null}

      <div className="mt-10 space-y-12">{children}</div>
    </main>
  );
}
