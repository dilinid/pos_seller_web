import type { StoreProfile, FeeBracket } from '../types/store.type';

function matchBracket(brackets: FeeBracket[], value: number | null): number {
  if (value == null) return 0;
  const match = brackets.find(
    (b) => b.fromValue <= value && (b.toValue === null || value < b.toValue)
  );
  return match?.fee ?? 0;
}

export function calculateDeliveryFee(
  config: Pick<StoreProfile, 'districtFees' | 'freeDeliveryMin' | 'weightFeeBrackets' | 'volumeFeeBrackets' | 'quantityFeeBrackets'>,
  districtId: string | null,
  items: { productId: string; quantity: number; weight: number | null; volume: number | null }[],
  subtotal: number
): number {
  if (!districtId || Object.keys(config.districtFees).length === 0) return 0;

  if (config.freeDeliveryMin !== null && subtotal >= config.freeDeliveryMin) return 0;

  const baseFee = config.districtFees[districtId] ?? 4.99;

  let extraFees = 0;
  for (const item of items) {
    const wtFee = matchBracket(config.weightFeeBrackets, item.weight) * item.quantity;
    const volFee = matchBracket(config.volumeFeeBrackets, item.volume) * item.quantity;
    const qtyFee = matchBracket(config.quantityFeeBrackets, item.quantity);
    extraFees += wtFee + volFee + qtyFee;
  }

  return baseFee + extraFees;
}
