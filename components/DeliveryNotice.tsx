import { Clock } from "lucide-react";
import { formatMoney, SHIPPING_FLAT } from "@/lib/pricing";

export function DeliveryNotice() {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-elevated p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4" aria-hidden />
        Estimated delivery: 8–15 business days
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ships from China after a 1–2 business day workshop check. The window starts when the
        workshop hands the parcel to the international carrier, and the tracking number is issued
        at that handoff.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Tracked shipping is a flat {formatMoney(SHIPPING_FLAT)}. It is a published contribution
        toward line-haul, not a carrier quote. If your country charges duty, customs bills you
        directly. You pay 50% on this site today, and the other 50% on this site after the
        shipment arrives.
      </p>
    </div>
  );
}
