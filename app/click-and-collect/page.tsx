import type { Metadata } from "next";
import CaseStudyShell from "@/components/CaseStudyShell";
import PickupConsole from "./PickupConsole";

export const metadata: Metadata = {
  title: "Surfacing In-Store Pickup Options",
};

export default function CaseStudyPage() {
  return (
    <CaseStudyShell
      title="Surfacing In-Store Pickup Options"
      intro={
        <>
          <p>
            <strong>Click &amp; Collect</strong> lets a customer pick up their
            order in store. The system automatically proposes candidate
            stores by combining two signals: <strong>stock availability</strong>{" "}
            (on hand, or via a transfer from the warehouse) and{" "}
            <strong>distance</strong> to the customer.
          </p>
          <p>
            Rules: only stores with stock inside a configurable radius are
            shown, sorted nearest to farthest, each with an estimated{" "}
            <code className="font-mono">pickup_eta</code>. Confirming creates
            a <strong>stock reservation</strong> with an expiration. This
            console simulates the whole flow client-side.
          </p>
        </>
      }
    >
      <PickupConsole />
    </CaseStudyShell>
  );
}
