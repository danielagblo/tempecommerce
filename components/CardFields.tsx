"use client";

export type CardFieldsValue = {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
};

export function CardFields({
  value,
  onChange,
  idPrefix,
}: {
  value: CardFieldsValue;
  onChange: (next: CardFieldsValue) => void;
  idPrefix: string;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted" htmlFor={`${idPrefix}-name`}>
        Name on card
        <input
          id={`${idPrefix}-name`}
          className="field mt-1"
          autoComplete="cc-name"
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
        />
      </label>
      <label className="block text-xs text-muted" htmlFor={`${idPrefix}-number`}>
        Card number
        <input
          id={`${idPrefix}-number`}
          className="field mt-1"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          value={value.number}
          onChange={(event) => onChange({ ...value, number: event.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs text-muted" htmlFor={`${idPrefix}-expiry`}>
          Expiry
          <input
            id={`${idPrefix}-expiry`}
            className="field mt-1"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            value={value.expiry}
            onChange={(event) => onChange({ ...value, expiry: event.target.value })}
          />
        </label>
        <label className="block text-xs text-muted" htmlFor={`${idPrefix}-cvc`}>
          CVC
          <input
            id={`${idPrefix}-cvc`}
            className="field mt-1"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            value={value.cvc}
            onChange={(event) => onChange({ ...value, cvc: event.target.value })}
          />
        </label>
      </div>
      <p className="text-xs leading-relaxed text-muted">
        The card is checked in this form. Oriel keeps the last four digits on the order and
        discards the rest.
      </p>
    </div>
  );
}

export const emptyCard: CardFieldsValue = { name: "", number: "", expiry: "", cvc: "" };
