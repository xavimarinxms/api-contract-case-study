/**
 * Case study registry.
 *
 * To add a new one:
 *   1. Create the `app/<slug>/` folder with its `page.tsx`.
 *   2. Add an entry here with `slug`, `title` and `summary`.
 * The home page ("/") list is generated from this array.
 */
export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "api-contract-negotiation",
    title: "Negotiating a Shared API Contract",
    summary:
      "One endpoint, two consumer teams, conflicting requests: a single additive contract with flexible time slots and sparse fieldsets instead of two divergent APIs.",
  },
  {
    slug: "click-and-collect",
    title: "Surfacing In-Store Pickup Options",
    summary:
      "Automatically matching stock and distance to propose store pickup: radius filter, nearest-first ordering, and a simulated stock reservation on confirm.",
  },
];
