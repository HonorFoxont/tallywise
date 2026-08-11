import { type ComboboxOption } from '@/components/ui/form-combobox';
import { modeOfPayment, TransactionType } from '@/types';

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.Income]: 'Income',
  [TransactionType.Expense]: 'Expense',
  [TransactionType.Savings]: 'Savings',
};

const PAYMENT_MODE_LABELS: Record<modeOfPayment, string> = {
  [modeOfPayment.Cash]: 'Cash',
  [modeOfPayment.Fonepay]: 'Fonepay',
  [modeOfPayment.Esewa]: 'Esewa',
  [modeOfPayment.Credit]: 'Credit',
};

export const TRANSACTION_TYPE_OPTIONS: ComboboxOption[] = Object.values(TransactionType).map(
  (type) => ({ value: type, label: TRANSACTION_TYPE_LABELS[type] })
);

export const PAYMENT_MODE_OPTIONS: ComboboxOption[] = Object.values(modeOfPayment).map((mode) => ({
  value: mode,
  label: PAYMENT_MODE_LABELS[mode],
}));

/** Maps the `{ id, name }` records used across categories and subcategories to combobox options. */
export function toNamedOptions(items: { id: string; name: string }[]): ComboboxOption[] {
  return items.map((item) => ({ value: item.id, label: item.name }));
}
