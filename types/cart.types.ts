
export interface CartItem {
  product_id: number;
  quantity: number;
  price: number;
  total_discount?: number;
}

export interface CartPayload {
  cart: {
    items: CartItem[];
  };
}

export interface CartItemWithDiscount extends CartItem {
  total_discount: number;
}

export interface UpdatedCart {
  items: CartItemWithDiscount[];
  total_price: number;
  total_discount: number;
  final_price: number;
}
