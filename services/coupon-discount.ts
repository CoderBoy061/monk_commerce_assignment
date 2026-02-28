import type {
  CartWiseDetails,
  ProductWiseDetails,
  BxGyDetails,
} from "../types/coupon.types";
import { isCartWise, isProductWise, isBxGy } from "../types/coupon.types";
import type { CartItem } from "../types/cart.types";

// calculate the total price of the items
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity * i.price, 0);
}

// check if the coupon is expired
export function isExpired(expiresAt?: Date): boolean {
  return expiresAt != null && new Date(expiresAt) < new Date();
}

// calculate the cart wise discount
export function cartWiseDiscount(
  items: CartItem[],
  details: CartWiseDetails,
): number {
  const total = cartTotal(items);
  if (total < details.threshold) return 0;
  return (total * details.discount) / 100;
}

// calculate the product wise discount
export function productWiseDiscount(
  items: CartItem[],
  details: ProductWiseDetails,
): number {
  const item = items.find((i) => i.product_id === details.product_id);
  if (!item) return 0;
  const lineTotal = item.quantity * item.price;
  return (lineTotal * details.discount) / 100;
}

// calculate the bxgy discount
export function bxgyDiscount(items: CartItem[], details: BxGyDetails): number {
  const buyIds = new Set(details.buy_products.map((b) => b.product_id));
  const getIds = new Set(details.get_products.map((g) => g.product_id));
  const buyRequired = details.buy_products.reduce((s, b) => s + b.quantity, 0);
  const getRequired = details.get_products.reduce((s, g) => s + g.quantity, 0);
  if (buyRequired <= 0 || getRequired <= 0) return 0;

  let buyCount = 0;
  const getItems: { product_id: number; quantity: number; price: number }[] =
    [];
  for (const item of items) {
    if (buyIds.has(item.product_id)) buyCount += item.quantity;
    if (getIds.has(item.product_id))
      getItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
  }
  const getCount = getItems.reduce((s, i) => s + i.quantity, 0);
  const applications = Math.min(
    Math.floor(buyCount / buyRequired),
    Math.floor(getCount / getRequired),
    details.repition_limit,
  );
  if (applications <= 0) return 0;
  const getUnitsFree = applications * getRequired;
  let discounted = 0;
  let remaining = getUnitsFree;
  for (const g of getItems) {
    if (remaining <= 0) break;
    const take = Math.min(g.quantity, remaining);
    discounted += take * g.price;
    remaining -= take;
  }
  return discounted;
}

// compute the discount based on the type of the coupon
export function computeDiscount(
  items: CartItem[],
  _type: string,
  details: CartWiseDetails | ProductWiseDetails | BxGyDetails,
): number {
  if (isCartWise(details)) return cartWiseDiscount(items, details);
  if (isProductWise(details)) return productWiseDiscount(items, details);
  if (isBxGy(details)) return bxgyDiscount(items, details);
  return 0;
}
