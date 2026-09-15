export default function getTransactionTypeColor(type: string) {
  switch (type) {
    case 'income':
      return 'bg-green-100 text-green-800';
    case 'expense':
      return 'bg-red-100 text-red-800';
    case 'savings':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
