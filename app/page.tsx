import Link from "next/link";
import { caseStudies } from "./caseStudies";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        Product Case Studies
      </h1>
      <p className="mt-3 text-sm text-neutral-600">
        A few interactive case studies from my work as a Product Owner. Each
        one lives on its own page and simulates the underlying API entirely
        client-side.
      </p>

      <ul className="mt-10 divide-y divide-neutral-200 border-t border-b border-neutral-200">
        {caseStudies.map((cs) => (
          <li key={cs.slug}>
            <Link
              href={`/${cs.slug}`}
              className="block py-5 group focus:outline-none focus-visible:bg-neutral-50"
            >
              <span className="text-base font-medium group-hover:underline underline-offset-4">
                {cs.title}
              </span>
              <span className="mt-1 block text-sm text-neutral-600">
                {cs.summary}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-neutral-400">
        Xavi Marín — Product Owner. Product and team names below are
        fictionalized; all data is simulated.
      </p>
    </main>
  );
}
