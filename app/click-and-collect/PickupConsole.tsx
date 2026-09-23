"use client";

import { useId, useMemo, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Reference data (client-side only, no backend, no real company data)        */
/* -------------------------------------------------------------------------- */

type ScenarioId = "nearby-stock" | "no-nearby-stock" | "transfer-required";

type Product = {
  id: string;
  name: string;
  /** Scenario activated by picking this product (can be overridden). */
  scenario: ScenarioId;
};

const PRODUCTS: Product[] = [
  { id: "5584/041", name: "Relaxed Linen Shirt", scenario: "nearby-stock" },
  { id: "4410/118", name: "Ribbed Knit Sweater", scenario: "nearby-stock" },
  { id: "2731/205", name: "High-Rise Wide-Leg Jeans", scenario: "transfer-required" },
  { id: "0962/300", name: "Limited-Edition Cropped Blazer", scenario: "no-nearby-stock" },
];

const SCENARIOS: { id: ScenarioId; label: string }[] = [
  { id: "nearby-stock", label: "Nearby stock" },
  { id: "no-nearby-stock", label: "No nearby stock" },
  { id: "transfer-required", label: "Transfer required" },
];

const RADII = [5, 10, 15, 20] as const;

type StoreBase = { id: string; name: string; distanceKm: number };

const STORES: StoreBase[] = [
  { id: "ST-DOWNTOWN", name: "Downtown Store", distanceKm: 1.2 },
  { id: "ST-CENTRAL", name: "Central Station Store", distanceKm: 2.8 },
  { id: "ST-WESTFIELD", name: "Westfield Mall Store", distanceKm: 9.4 },
  { id: "ST-RIVERSIDE", name: "Riverside Village Store", distanceKm: 14.1 },
  { id: "ST-NORTHPOINT", name: "North Point Store", distanceKm: 18.3 },
];

type Source = "on_hand" | "transfer" | "none";

/** Per-store stock by scenario: reservable units and where they come from. */
const AVAILABILITY: Record<ScenarioId, Record<string, { units: number; source: Source }>> = {
  "nearby-stock": {
    "ST-DOWNTOWN": { units: 6, source: "on_hand" },
    "ST-CENTRAL": { units: 3, source: "on_hand" },
    "ST-WESTFIELD": { units: 12, source: "on_hand" },
    "ST-RIVERSIDE": { units: 4, source: "on_hand" },
    "ST-NORTHPOINT": { units: 0, source: "none" },
  },
  "no-nearby-stock": {
    "ST-DOWNTOWN": { units: 0, source: "none" },
    "ST-CENTRAL": { units: 0, source: "none" },
    "ST-WESTFIELD": { units: 0, source: "none" },
    "ST-RIVERSIDE": { units: 0, source: "none" },
    // There is stock, but at 18.3 km it only shows up if the radius is widened to 20 km.
    "ST-NORTHPOINT": { units: 9, source: "on_hand" },
  },
  "transfer-required": {
    "ST-DOWNTOWN": { units: 5, source: "transfer" },
    "ST-CENTRAL": { units: 5, source: "transfer" },
    "ST-WESTFIELD": { units: 2, source: "transfer" },
    "ST-RIVERSIDE": { units: 0, source: "none" },
    "ST-NORTHPOINT": { units: 7, source: "on_hand" },
  },
};

/* Deterministic base dates (avoids hydration mismatch from Date.now()). */
const RESERVED_AT = new Date("2026-09-09T14:00:00.000Z");
const HOLD_HOURS = 72;
const ETA_ON_HAND_HOURS = 2;

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/*  Derived model                                                              */
/* -------------------------------------------------------------------------- */

type PickupOption = StoreBase & {
  units: number;
  source: Exclude<Source, "none">;
  availabilityLabel: string;
  pickupEta: string;
};

function buildOptions(scenario: ScenarioId, radiusKm: number): {
  options: PickupOption[];
  discardedNoStock: number;
  discardedRadius: number;
} {
  const table = AVAILABILITY[scenario];
  let discardedNoStock = 0;
  let discardedRadius = 0;

  const options: PickupOption[] = [];
  for (const store of STORES) {
    const entry = table[store.id];
    const hasStock = entry && entry.source !== "none" && entry.units > 0;

    if (!hasStock) {
      discardedNoStock += 1;
      continue;
    }
    if (store.distanceKm > radiusKm) {
      discardedRadius += 1;
      continue;
    }

    const source = entry.source as Exclude<Source, "none">;
    const pickupEta =
      source === "on_hand"
        ? addHours(RESERVED_AT, ETA_ON_HAND_HOURS).toISOString()
        : isoDate(addHours(RESERVED_AT, 24));

    options.push({
      ...store,
      units: entry.units,
      source,
      availabilityLabel:
        source === "on_hand"
          ? `Ready in ${ETA_ON_HAND_HOURS}h`
          : "Ready tomorrow",
      pickupEta,
    });
  }

  options.sort((a, b) => a.distanceKm - b.distanceKm);
  return { options, discardedNoStock, discardedRadius };
}

/* -------------------------------------------------------------------------- */
/*  Shared UI (same visual language as the other case study)                   */
/* -------------------------------------------------------------------------- */

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-neutral-800">
      {children}
    </pre>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex flex-wrap gap-1 rounded-md bg-neutral-100 p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={
              "rounded px-2.5 py-1 text-sm transition-colors " +
              (active
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Console                                                                    */
/* -------------------------------------------------------------------------- */

const ORDER_ID = "ORD-2026-44718";

export default function PickupConsole() {
  const listId = useId();

  const [query, setQuery] = useState(PRODUCTS[0].name);
  const [scenarioOverride, setScenarioOverride] = useState<ScenarioId | null>(
    null,
  );
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [reservedStoreId, setReservedStoreId] = useState<string | null>(null);

  const matchedProduct = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (
      PRODUCTS.find((p) => p.name.toLowerCase() === q) ??
      PRODUCTS.find((p) => q.length > 1 && p.name.toLowerCase().includes(q)) ??
      PRODUCTS.find((p) => q.length > 1 && p.id.toLowerCase().includes(q)) ??
      null
    );
  }, [query]);

  const scenario: ScenarioId =
    scenarioOverride ?? matchedProduct?.scenario ?? "nearby-stock";

  const { options, discardedNoStock, discardedRadius } = useMemo(
    () => buildOptions(scenario, radiusKm),
    [scenario, radiusKm],
  );

  // Any change of context invalidates the reservation shown.
  const reservationKey = `${scenario}|${radiusKm}|${matchedProduct?.id ?? "-"}`;
  const [lastKey, setLastKey] = useState(reservationKey);
  if (lastKey !== reservationKey) {
    setLastKey(reservationKey);
    if (reservedStoreId) setReservedStoreId(null);
  }

  const reservedOption =
    options.find((o) => o.id === reservedStoreId) ?? null;

  const reservationPayload = reservedOption
    ? {
        order_id: ORDER_ID,
        store_id: reservedOption.id,
        product_id: matchedProduct?.id ?? "n/a",
        product: matchedProduct?.name ?? query.trim(),
        units_reserved: 1,
        reservation_type:
          reservedOption.source === "on_hand"
            ? "on_hand"
            : "warehouse_transfer",
        pickup_eta: reservedOption.pickupEta,
        reserved_at: RESERVED_AT.toISOString(),
        expires_at: addHours(RESERVED_AT, HOLD_HOURS).toISOString(),
        status: "hold",
      }
    : null;

  return (
    <div className="space-y-12">
      {/* --------------------------------------------------------------- */}
      {/*  1. Product search + parameters                                  */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight">
          Product and search radius
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Type or pick a product from the simulated catalog. The{" "}
          <code className="font-mono">radius_km</code> bounds which stores
          are considered.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`${listId}-q`}
              className="text-sm text-neutral-800"
            >
              Product
            </label>
            <input
              id={`${listId}-q`}
              list={listId}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setScenarioOverride(null);
              }}
              placeholder="E.g. Relaxed Linen Shirt"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-800 sm:max-w-sm"
            />
            <datalist id={listId}>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.id}
                </option>
              ))}
            </datalist>
            <p className="text-xs text-neutral-400">
              {matchedProduct ? (
                <>
                  Catalog:{" "}
                  <code className="font-mono">{matchedProduct.id}</code> ·{" "}
                  {matchedProduct.name}
                </>
              ) : (
                "No match in the simulated catalog — use the scenario selector."
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-800">Demo scenario</span>
            <Segmented<ScenarioId>
              ariaLabel="Product scenario"
              value={scenario}
              onChange={(next) => setScenarioOverride(next)}
              options={SCENARIOS.map((s) => ({ value: s.id, label: s.label }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-800">
              Radius (<code className="font-mono">radius_km</code>)
            </span>
            <Segmented<number>
              ariaLabel="Search radius in kilometers"
              value={radiusKm}
              onChange={setRadiusKm}
              options={RADII.map((r) => ({ value: r, label: `${r} km` }))}
            />
          </div>
        </div>
      </section>

      <hr className="border-neutral-200" />

      {/* --------------------------------------------------------------- */}
      {/*  2. Pickup options                                               */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight">
          Pickup options
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Stores with stock within{" "}
          <code className="font-mono">{radiusKm} km</code>, sorted by
          distance.
        </p>

        {options.length === 0 ? (
          <div className="mt-4 rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
            <p className="text-sm font-medium text-neutral-800">
              No pickup options available for this product
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              No store has stock or an eligible transfer within {radiusKm}{" "}
              km.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {options.map((o) => {
              const isReserved = o.id === reservedStoreId;
              return (
                <li
                  key={o.id}
                  className={
                    "rounded-md border p-4 transition-colors " +
                    (isReserved
                      ? "border-neutral-800 bg-neutral-50"
                      : "border-neutral-200")
                  }
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {o.name}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-neutral-500">
                        {o.id}
                      </p>
                      <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
                        <div className="flex gap-1">
                          <dt className="text-neutral-400">Distance</dt>
                          <dd className="font-mono text-neutral-800">
                            {o.distanceKm.toFixed(1)} km
                          </dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="text-neutral-400">Stock</dt>
                          <dd className="font-mono text-neutral-800">
                            {o.source === "on_hand"
                              ? `${o.units} units on hand`
                              : `${o.units} units via transfer`}
                          </dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="text-neutral-400">Pickup</dt>
                          <dd className="font-mono text-neutral-800">
                            {o.availabilityLabel}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setReservedStoreId(isReserved ? null : o.id)
                      }
                      className={
                        "shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors " +
                        (isReserved
                          ? "border border-neutral-800 text-neutral-800 hover:bg-neutral-100"
                          : "bg-neutral-900 text-white hover:bg-neutral-700")
                      }
                    >
                      {isReserved ? "Cancel reservation" : "Confirm pickup"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {(discardedNoStock > 0 || discardedRadius > 0) && (
          <p className="mt-3 text-xs text-neutral-400">
            Discarded: {discardedNoStock} out of stock ·{" "}
            {discardedRadius} outside the radius.
          </p>
        )}
      </section>

      <hr className="border-neutral-200" />

      {/* --------------------------------------------------------------- */}
      {/*  3. Behind the scenes: stock reservation                         */}
      {/* --------------------------------------------------------------- */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight">
          Behind the scenes — stock reservation
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          On confirm, the API locks 1 unit at the chosen store (
          <code className="font-mono">on_hand</code>) or kicks off a{" "}
          <code className="font-mono">warehouse_transfer</code>. The
          reservation expires after {HOLD_HOURS}h.
        </p>

        <div className="mt-4">
          {reservationPayload ? (
            <CodeBlock>
              <span className="text-neutral-500">
                POST /click-and-collect/reservations
              </span>
              {"\n"}
              {JSON.stringify(reservationPayload, null, 2)}
            </CodeBlock>
          ) : (
            <CodeBlock>
              <span className="text-neutral-500">
                POST /click-and-collect/reservations
              </span>
              {"\n"}
              {"// Confirm a pickup above to generate the payload."}
            </CodeBlock>
          )}
        </div>
      </section>
    </div>
  );
}
