import { type Transaction } from '~/src/types';

export default function filterTransactions(
  searchTerm,
  typeFilter,
  categoryFilter,
  paymentFilter,
  dateRangeFilter,
  transactions,
  categories,
  subCategories
) {
  let filtered: Transaction[] = transactions;

  if (searchTerm) {
    filtered = filtered.filter((t) => {
      const categoryName = categories.find((c) => c.id === t.categoryId)?.name || '';
      const subCategoryName = subCategories.find((s) => s.id === t.subCategoryId)?.name || '';
      return (
        t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subCategoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  if (typeFilter !== 'all') {
    filtered = filtered.filter((t) => t.type === typeFilter);
  }

  if (categoryFilter !== 'all') {
    filtered = filtered.filter((t) => t.categoryId === categoryFilter);
  }

  if (paymentFilter !== 'all') {
    filtered = filtered.filter((t) => t.modeOfPayment === paymentFilter);
  }
  filtered = filtered.filter(
    (t) => t.createdAt > dateRangeFilter.start && t.createdAt < dateRangeFilter.end
  );
  return filtered;
}
