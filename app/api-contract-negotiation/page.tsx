import type { Metadata } from "next";
import CaseStudyShell from "@/components/CaseStudyShell";
import ContractConsole from "./ContractConsole";

export const metadata: Metadata = {
  title: "Negotiating a Shared API Contract",
};

export default function CaseStudyPage() {
  return (
    <CaseStudyShell
      title="Negotiating a Shared API Contract"
      intro={
        <>
          <p>
            <strong>Delivery Scheduling</strong> is the order-fulfillment API
            behind this case study. Two consumer teams asked for different
            changes to the same endpoint{" "}
            <code className="font-mono">/modify-delivery-date</code>: the{" "}
            <strong>Web Storefront</strong> team needed more flexible pickup
            time slots, and the <strong>Mobile App</strong> team needed
            lighter responses to keep payloads small on mobile networks.
          </p>
          <p>
            My call: ship a <strong>single endpoint with an additive
            (backward-compatible) contract</strong> — a flexible{" "}
            <code className="font-mono">time_slots</code> array plus a{" "}
            <code className="font-mono">?fields=</code> query parameter for
            sparse fieldsets — instead of forking the endpoint per team. This
            console shows how it behaves.
          </p>
        </>
      }
    >
      <ContractConsole />
    </CaseStudyShell>
  );
}
