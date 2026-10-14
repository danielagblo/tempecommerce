import type { OrderStatus } from "@/lib/types";

const steps: { id: OrderStatus; label: string; detail: string }[] = [
  {
    id: "pending",
    label: "Pending",
    detail: "Order received. The workshop has not packed it yet.",
  },
  {
    id: "processing",
    label: "Processing",
    detail: "Quality check and packing in China.",
  },
  {
    id: "shipped",
    label: "Shipped",
    detail: "On the way. The second payment stays closed until it arrives.",
  },
  {
    id: "arrived",
    label: "Arrived",
    detail: "The parcel is with you. The remaining 50% can be paid on this page.",
  },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIndex = steps.findIndex((step) => step.id === status);

  return (
    <ol className="mt-6 space-y-0">
      {steps.map((step, index) => {
        const state = index < activeIndex ? "done" : index === activeIndex ? "current" : "upcoming";
        return (
          <li key={step.id} className="grid grid-cols-[1.25rem_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-3 w-3 rounded-full border ${
                  state === "upcoming"
                    ? "border-line bg-transparent"
                    : state === "current"
                      ? "border-ink bg-ink ring-4 ring-ink/20"
                      : "border-ink bg-ink"
                }`}
              />
              {index < steps.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
            </div>
            <div className={index < steps.length - 1 ? "pb-6" : ""}>
              <p className={`text-sm font-medium ${state === "upcoming" ? "text-muted" : ""}`}>
                {step.label}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
