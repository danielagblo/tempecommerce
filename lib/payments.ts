export type PaymentSplit = {
  deposit: number;
  balance: number;
};

export function splitHalf(total: number): PaymentSplit {
  const cents = Math.round(total * 100);
  const depositCents = Math.floor(cents / 2);
  return {
    deposit: depositCents / 100,
    balance: (cents - depositCents) / 100,
  };
}

export type CardInput = {
  name: string;
  number: string;
  expiry: string;
  cvc: string;
};

export type CardCheck = { ok: true; last4: string } | { ok: false; message: string };

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function luhnValid(number: string): boolean {
  let sum = 0;
  let alternate = false;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export function readCard(input: CardInput): CardCheck {
  if (input.name.trim().length < 2) {
    return { ok: false, message: "Enter the name on the card." };
  }

  const number = digitsOnly(input.number);
  if (number.length < 13 || number.length > 19 || !luhnValid(number)) {
    return { ok: false, message: "Enter a valid card number." };
  }

  const expiry = digitsOnly(input.expiry);
  if (expiry.length !== 4) {
    return { ok: false, message: "Enter the expiry as MM/YY." };
  }
  const month = Number(expiry.slice(0, 2));
  const year = 2000 + Number(expiry.slice(2));
  if (month < 1 || month > 12) {
    return { ok: false, message: "Enter a real expiry month." };
  }
  const now = new Date();
  const expired =
    year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  if (expired) {
    return { ok: false, message: "This card is expired." };
  }

  const cvc = digitsOnly(input.cvc);
  if (cvc.length < 3 || cvc.length > 4) {
    return { ok: false, message: "Enter the 3-digit security code." };
  }

  return { ok: true, last4: number.slice(-4) };
}
