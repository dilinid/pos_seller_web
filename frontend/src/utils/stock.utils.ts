export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(quantity: number, reorderLevel?: number): StockStatus {
  if (quantity <= 0) return 'out_of_stock';
  if (reorderLevel != null && quantity <= reorderLevel) return 'low_stock';
  return 'in_stock';
}

export function isLowStock(quantity: number, reorderLevel?: number): boolean {
  return getStockStatus(quantity, reorderLevel) !== 'in_stock';
}

export const STOCK_STATUS_META: Record<StockStatus, { bg: string; color: string; label: string }> = {
  in_stock:     { bg: '#f0fdf4', color: '#16a34a', label: 'In Stock' },
  low_stock:    { bg: '#fffbeb', color: '#d97706', label: 'Low Stock' },
  out_of_stock: { bg: '#fef2f2', color: '#dc2626', label: 'Out of Stock' },
};

export function sortByStockPriority<T extends { quantity: number; reorderLevel?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aLow = isLowStock(a.quantity, a.reorderLevel);
    const bLow = isLowStock(b.quantity, b.reorderLevel);
    if (aLow && !bLow) return -1;
    if (!aLow && bLow) return 1;
    return a.quantity - b.quantity;
  });
}

export function groupByStockStatus<T extends { quantity: number; reorderLevel?: number }>(items: T[]): {
  lowStock: T[];
  inStock: T[];
} {
  return {
    lowStock: items.filter((i) => isLowStock(i.quantity, i.reorderLevel)),
    inStock: items.filter((i) => !isLowStock(i.quantity, i.reorderLevel)),
  };
}
