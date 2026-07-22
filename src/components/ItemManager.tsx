import { calculateTotals, lineTotal } from '../utils/vat';
import { formatCurrency } from '../utils/format';
import type { LineItem, VatRate } from '../types/erp';
import { VAT_OPTIONS } from '../types/erp';
import { newLineItem } from '../utils/erpStorage';

interface ItemManagerProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export function ItemManager({ items, onChange }: ItemManagerProps) {
  const totals = calculateTotals(items);

  const update = (id: string, patch: Partial<LineItem>) => {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  return (
    <div className="item-manager">
      <div className="item-manager__head">
        <h3>Položky / DPH</h3>
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => onChange([...items, newLineItem()])}>
          + Přidat řádek
        </button>
      </div>

      <div className="item-table">
        <div className="item-table__head">
          <span>Název položky</span>
          <span>Množství</span>
          <span>Cena / j.</span>
          <span>DPH</span>
          <span>Celkem</span>
          <span />
        </div>
        {items.map((item) => (
          <div className="item-table__row" key={item.id}>
            <input
              value={item.name}
              placeholder="Název položky"
              onChange={(e) => update(item.id, { name: e.target.value })}
            />
            <input
              type="number"
              min={0}
              step={1}
              value={item.qty}
              onChange={(e) => update(item.id, { qty: Number(e.target.value) || 0 })}
            />
            <input
              type="number"
              min={0}
              step={100}
              value={item.unitPrice}
              onChange={(e) => update(item.id, { unitPrice: Number(e.target.value) || 0 })}
            />
            <select
              value={item.vatRate}
              onChange={(e) => update(item.id, { vatRate: Number(e.target.value) as VatRate })}
            >
              {VAT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <strong>{formatCurrency(lineTotal(item))}</strong>
            <button
              type="button"
              className="icon-btn"
              aria-label="Smazat řádek"
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
              disabled={items.length <= 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="vat-summary">
        <div>
          <span>Základ bez DPH</span>
          <strong>{formatCurrency(totals.subtotal)}</strong>
        </div>
        {totals.vatByRate.map((b) => (
          <div key={b.rate}>
            <span>
              DPH {b.rate}% <em>(základ {formatCurrency(b.base)})</em>
            </span>
            <strong>{formatCurrency(b.vat)}</strong>
          </div>
        ))}
        <div className="vat-summary__total">
          <span>Celkem vč. DPH</span>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
      </div>
    </div>
  );
}
