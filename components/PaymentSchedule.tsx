import { formatMoney } from "@/lib/pricing";

export function PaymentSchedule({
  deposit,
  balance,
  depositPaid,
  balancePaid,
  balancePayable,
}: {
  deposit: number;
  balance: number;
  depositPaid: boolean;
  balancePaid: boolean;
  balancePayable: boolean;
}) {
  const balanceLabel = balancePaid ? "Paid" : balancePayable ? "Due now" : "Due after arrival";

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">How you pay</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        The deposit is paid at checkout on this site. The balance is paid on the tracking page
        after the shipment arrives.
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt>
            <span className="block font-medium">Deposit · 50%</span>
            <span className="text-muted">{depositPaid ? "Paid at checkout" : "Due now"}</span>
          </dt>
          <dd className="nums text-base">{formatMoney(deposit)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt>
            <span className="block font-medium">Balance · 50%</span>
            <span className="text-muted">{balanceLabel}</span>
          </dt>
          <dd className="nums text-base">{formatMoney(balance)}</dd>
        </div>
      </dl>
    </div>
  );
}
