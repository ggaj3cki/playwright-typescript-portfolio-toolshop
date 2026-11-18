const priceAmountSource = String.raw`(\d+|\d{1,3}(?:,\d{3})+)\.(\d{2})`;
export const priceTextPattern = new RegExp(`^\\$?${priceAmountSource}$`);
export const cartPriceTextPattern = new RegExp(`^\\$${priceAmountSource}$`);

export function parsePriceInCents(text: string): number {
  const match = priceTextPattern.exec(text.trim());
  if (!match) throw new Error(`Unexpected price format: ${text}`);

  const cents = Number(match[1].replaceAll(',', '')) * 100 + Number(match[2]);
  if (!Number.isSafeInteger(cents)) {
    throw new Error(`Unexpected price format: ${text}`);
  }
  return cents;
}

export function dollarsToCents(amount: number): number {
  if (!Number.isFinite(amount)) throw new Error('Non-finite price amount');
  return Math.round(amount * 100);
}
