export interface ApplicableCouponItem {
  coupon_id: string;
  type: string;
  discount: number;
}

export interface ApplicableCouponsResponse {
  applicable_coupons: ApplicableCouponItem[];
}

import type { UpdatedCart } from "./cart.types";

export interface ApplyCouponResponse {
  updated_cart: UpdatedCart;
}
