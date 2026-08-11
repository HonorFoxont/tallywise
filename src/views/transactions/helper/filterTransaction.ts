import { type Category, type SubCategory, type Transaction } from '~/src/types';

type DateRangeFilter = {
  start: Date;
  end: Date;
};

export default function filterTransactions(
  searchTerm: string,
  typeFilter: string | null,
  categoryFilter: string | null,
  paymentFilter: string | null,
  dateRangeFilter: DateRangeFilter,
  transactions: Transaction[],
  categories: Category[],
  subCategories: SubCategory[]
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

  if (typeFilter) {
    filtered = filtered.filter((t) => t.type === typeFilter);
  }

  if (categoryFilter) {
    filtered = filtered.filter((t) => t.categoryId === categoryFilter);
  }

  if (paymentFilter) {
    filtered = filtered.filter((t) => t.modeOfPayment === paymentFilter);
  }
  filtered = filtered.filter(
    (t) => t.createdAt > dateRangeFilter.start && t.createdAt < dateRangeFilter.end
  );
  return filtered;
}
