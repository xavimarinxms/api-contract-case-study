"use client";

import { useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Reference data (client-side only, no backend, no real company data)        */
/* -------------------------------------------------------------------------- */

type TimeSlot = { id: string; start: string; end: string };

const STOREFRONT_SLOTS: TimeSlot[] = [
  { id: "s1", start: "09:00", end: "10:30" },
  { id: "s2", start: "10:00", end: "12:30" },
  { id: "s3", start: "17:00", end: "18:00" },
];

const APP_FIELDS = ["slots", "eta", "carrier", "warehouse", "history"] as const;
type AppField = (typeof APP_FIELDS)[number];

const FULL_RESPONSE: Record<AppField | "order_id", unknown> = {
  order_id: "ORD-2026-77410",
  slots: [{ start: "10:00", end: "12:30" }],
  eta: "2026-09-10T14:00:00Z",
  carrier: { name: "FastTrack Logistics", tracking: "9871234" },
  warehouse: { id: "WH-04", city: "Denver" },
  history: [{ status: "created", at: "2026-09-05" }],
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

/* -------------------------------------------------------------------------- */
/*  Reusable code block                                                        */
/* -------------------------------------------------------------------------- */

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-neutral-800">
      {children}
    </pre>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 accent-neutral-800"
      />
      <span className="font-mono">{label}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*  Web Storefront block                                                       */
/* -------------------------------------------------------------------------- */

function StorefrontBlock() {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    s1: true,
    s2: false,
    s3: false,
  });

  const timeSlots = useMemo(
    () =>
      STOREFRONT_SLOTS.filter((s) => selected[s.id]).map(({ start, end }) => ({
        start,
        end,
      })),
    [selected],
  );

  const body = {
    order_id: "ORD-2026-88213",
    time_slots: timeSlots,
  };

  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">
        Web Storefront — flexible time slots
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        The <code className="font-mono">time_slots</code> array accepts as
        many windows as the customer needs. Tick several at once.
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {STOREFRONT_SLOTS.map((s) => (
          <Checkbox
            key={s.id}
            checked={!!selected[s.id]}
            onChange={(next) =>
              setSelected((prev) => ({ ...prev, [s.id]: next }))
            }
            label={`${s.start}–${s.end}`}
          />
        ))}
      </div>

      <div className="mt-5">
        <CodeBlock>
          <span className="text-neutral-500">POST /modify-delivery-date</span>
          {"\n"}
          {JSON.stringify(body, null, 2)}
        </CodeBlock>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile App block                                                          */
/* -------------------------------------------------------------------------- */

function MobileAppBlock() {
  const [selected, setSelected] = useState<Record<AppField, boolean>>({
    slots: true,
    eta: true,
    carrier: false,
    warehouse: false,
    history: false,
  });

  const activeFields = APP_FIELDS.filter((f) => selected[f]);

  const filtered = useMemo(() => {
    const out: Record<string, unknown> = { order_id: FULL_RESPONSE.order_id };
    for (const f of activeFields) out[f] = FULL_RESPONSE[f];
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const filteredBytes = byteLength(filtered);
  const fullBytes = byteLength(FULL_RESPONSE);
  const saved = fullBytes - filteredBytes;
  const savedPct = Math.round((saved / fullBytes) * 100);

  const query = activeFields.join(",");

  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">
        Mobile App — sparse fieldset
      </h2>
      <p className="mt-1 text-sm text-neutral-600">
        The <code className="font-mono">?fields=</code> parameter trims the
        response down to the essentials.{" "}
        <code className="font-mono">order_id</code> is always returned.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {APP_FIELDS.map((f) => (
          <Checkbox
            key={f}
            checked={selected[f]}
            onChange={(next) =>
              setSelected((prev) => ({ ...prev, [f]: next }))
            }
            label={f}
          />
        ))}
      </div>

      <div className="mt-5">
        <CodeBlock>
          <span className="text-neutral-500">
            GET /modify-delivery-date?fields={query || "∅"}
          </span>
          {"\n"}
          {JSON.stringify(filtered, null, 2)}
        </CodeBlock>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-neutral-500">Filtered response</dt>
          <dd className="font-mono text-neutral-900">{filteredBytes} B</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Full response</dt>
          <dd className="font-mono text-neutral-900">{fullBytes} B</dd>
        </div>
        <div>
          <dt className="text-neutral-500">Savings</dt>
          <dd className="font-mono text-neutral-900">
            {saved} B ({savedPct}%)
          </dd>
        </div>
      </dl>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-neutral-100">
        <div
          className="h-full bg-neutral-800 transition-all"
          style={{
            width: `${Math.max(0, Math.min(100, (filteredBytes / fullBytes) * 100))}%`,
          }}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-400">
        Sizes measured on the serialized JSON with no whitespace (UTF-8
        bytes).
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Console                                                                    */
/* -------------------------------------------------------------------------- */

export default function ContractConsole() {
  return (
    <div className="space-y-12">
      <StorefrontBlock />
      <hr className="border-neutral-200" />
      <MobileAppBlock />
    </div>
  );
}
