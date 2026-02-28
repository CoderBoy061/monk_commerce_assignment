export type CouponType = "cart-wise" | "product-wise" | "bxgy";

export interface CartWiseDetails {
  threshold: number;
  discount: number; // percentage
}

export interface ProductWiseDetails {
  product_id: number;
  discount: number; // percentage
}

export interface BxGyProductQuantity {
  product_id: number;
  quantity: number;
}

export interface BxGyDetails {
  buy_products: BxGyProductQuantity[];
  get_products: BxGyProductQuantity[];
  repition_limit: number; // typo from spec: repition_limit
}

export type CouponDetails = CartWiseDetails | ProductWiseDetails | BxGyDetails;

export interface CouponInput {
  type: CouponType;
  details: CouponDetails;
  expiresAt?: string; // ISO date
}

export interface ICoupon {
  _id: string;
  type: CouponType;
  details: CouponDetails;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// type guards to check the type of the coupon details
export function isCartWise(details: CouponDetails): details is CartWiseDetails {
  return "threshold" in details && typeof (details as CartWiseDetails).threshold === "number";
}

export function isProductWise(details: CouponDetails): details is ProductWiseDetails {
  return "product_id" in details && typeof (details as ProductWiseDetails).product_id === "number";
}

export function isBxGy(details: CouponDetails): details is BxGyDetails {
  return "buy_products" in details && Array.isArray((details as BxGyDetails).buy_products);
}
