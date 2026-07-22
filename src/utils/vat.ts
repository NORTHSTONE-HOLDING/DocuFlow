import type { LineItem, MoneyTotals, VatBucket, VatRate } from '../types/erp';

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function lineBase(item: LineItem): number {
  return roundMoney(item.qty * item.unitPrice);
}

export function lineVat(item: LineItem): number {
  return roundMoney(lineBase(item) * (item.vatRate / 100));
}

export function lineTotal(item: LineItem): number {
  return roundMoney(lineBase(item) + lineVat(item));
}

export function calculateTotals(items: LineItem[]): MoneyTotals {
  const map = new Map<VatRate, VatBucket>();
  for (const rate of [21, 12, 0] as VatRate[]) {
    map.set(rate, { rate, base: 0, vat: 0 });
  }

  let subtotal = 0;
  for (const item of items) {
    const base = lineBase(item);
    const vat = lineVat(item);
    subtotal += base;
    const bucket = map.get(item.vatRate)!;
    bucket.base = roundMoney(bucket.base + base);
    bucket.vat = roundMoney(bucket.vat + vat);
  }

  const vatByRate = [...map.values()].filter((b) => b.base > 0 || b.vat > 0);
  const vatTotal = roundMoney(vatByRate.reduce((s, b) => s + b.vat, 0));
  const total = roundMoney(subtotal + vatTotal);

  return {
    subtotal: roundMoney(subtotal),
    vatByRate,
    vatTotal,
    total,
  };
}

/** Scale all line items by percent (e.g. 40% advance). */
export function scaleItems(items: LineItem[], percent: number): LineItem[] {
  const factor = percent / 100;
  return items.map((item) => ({
    ...item,
    id: `${item.id}_scaled`,
    name: `${item.name} (${percent} %)`,
    unitPrice: roundMoney(item.unitPrice * factor),
  }));
}

/** Remaining balance items after advance percent was invoiced. */
export function remainingItems(items: LineItem[], advancePercent: number): LineItem[] {
  return scaleItems(items, 100 - advancePercent).map((item) => ({
    ...item,
    name: item.name.replace(`(${100 - advancePercent} %)`, '(doplatek)'),
  }));
}
