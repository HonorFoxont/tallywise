export default function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace('NPR', 'Rs ');
}
