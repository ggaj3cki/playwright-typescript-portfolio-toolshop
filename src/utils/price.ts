export function parsePriceInCents(text: string): number {
  const match = /^\$?(\d+|\d{1,3}(?:,\d{3})+)\.(\d{2})$/.exec(text.trim());
  if (!match) throw new Error(`Unexpected price format: ${text}`);

  const cents = Number(match[1].replaceAll(',', '')) * 100 + Number(match[2]);
  if (!Number.isSafeInteger(cents)) {
    throw new Error(`Unexpected price format: ${text}`);
  }
  return cents;
}
