/*
 * Money is stored and sent as an integer number of paisa (Rs 1,499.50 -> 149950), exactly like
 * the backend. Floats are never used for amounts: 0.1 + 0.2 !== 0.3 in JavaScript.
 */

const PAISA_PER_RUPEE = 100;

const pkrFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 149950 -> "PKR 1,499.5" */
export function formatPaisa(paisa: number): string {
  return pkrFormatter.format(paisa / PAISA_PER_RUPEE);
}

/**
 * "1,499.50" -> 149950, parsed as text (rupees and paisa separately) so no float
 * rounding can turn 19.99 into 1998.9999. Returns null for invalid input.
 */
export function rupeesToPaisa(input: string): number | null {
  const normalized = input.trim().replaceAll(",", "");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [rupeesPart = "0", paisaPart = ""] = normalized.split(".");
  return Number(rupeesPart) * PAISA_PER_RUPEE + Number(paisaPart.padEnd(2, "0"));
}

/** 149950 -> "1499.50", for pre-filling a rupee input on the edit form. */
export function paisaToRupeeInput(paisa: number): string {
  const rupees = Math.floor(paisa / PAISA_PER_RUPEE);
  const remainder = paisa % PAISA_PER_RUPEE;
  return remainder === 0 ? String(rupees) : `${rupees}.${String(remainder).padStart(2, "0")}`;
}
