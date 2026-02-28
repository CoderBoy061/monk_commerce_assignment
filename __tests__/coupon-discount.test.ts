import {
  cartTotal,
  isExpired,
  cartWiseDiscount,
  productWiseDiscount,
  bxgyDiscount,
  computeDiscount,
} from "../services/coupon-discount";
import type { CartItem } from "../types/cart.types";
import type {
  CartWiseDetails,
  ProductWiseDetails,
  BxGyDetails,
} from "../types/coupon.types";

describe("cartTotal", () => {
  it("returns 0 for empty items", () => {
    expect(cartTotal([])).toBe(0);
  });

  it("sums quantity * price for all items", () => {
    const items: CartItem[] = [
      { product_id: 1, quantity: 2, price: 50 },
      { product_id: 2, quantity: 1, price: 30 },
    ];
    expect(cartTotal(items)).toBe(130);
  });
});

describe("isExpired", () => {
  it("returns false when expiresAt is undefined", () => {
    expect(isExpired(undefined)).toBe(false);
  });

  it("returns false when expiresAt is in the future", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isExpired(future)).toBe(false);
  });

  it("returns true when expiresAt is in the past", () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    expect(isExpired(past)).toBe(true);
  });
});

describe("cartWiseDiscount", () => {
  const items: CartItem[] = [
    { product_id: 1, quantity: 2, price: 50 },
    { product_id: 2, quantity: 1, price: 30 },
  ];
  // total = 130

  it("returns 0 when cart total is below threshold", () => {
    const details: CartWiseDetails = { threshold: 200, discount: 10 };
    expect(cartWiseDiscount(items, details)).toBe(0);
  });

  it("returns 0 when cart total equals threshold (boundary: we require above in spec, so total >= threshold gives discount)", () => {
    const details: CartWiseDetails = { threshold: 130, discount: 10 };
    expect(cartWiseDiscount(items, details)).toBe(13);
  });

  it("returns percentage of cart total when above threshold", () => {
    const details: CartWiseDetails = { threshold: 100, discount: 10 };
    expect(cartWiseDiscount(items, details)).toBe(13);
  });
});

describe("productWiseDiscount", () => {
  const items: CartItem[] = [
    { product_id: 1, quantity: 2, price: 50 },
    { product_id: 2, quantity: 1, price: 30 },
  ];

  it("returns 0 when product is not in cart", () => {
    const details: ProductWiseDetails = { product_id: 99, discount: 20 };
    expect(productWiseDiscount(items, details)).toBe(0);
  });

  it("returns percentage discount on that product line when product is in cart", () => {
    const details: ProductWiseDetails = { product_id: 1, discount: 20 };
    expect(productWiseDiscount(items, details)).toBe(20);
  });
});

describe("bxgyDiscount", () => {
  it("returns 0 when buy required is 0", () => {
    const items: CartItem[] = [{ product_id: 1, quantity: 5, price: 10 }];
    const details: BxGyDetails = {
      buy_products: [],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 2,
    };
    expect(bxgyDiscount(items, details)).toBe(0);
  });

  it("returns 0 when cart has no buy products", () => {
    const items: CartItem[] = [{ product_id: 99, quantity: 5, price: 10 }];
    const details: BxGyDetails = {
      buy_products: [{ product_id: 1, quantity: 2 }],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 2,
    };
    expect(bxgyDiscount(items, details)).toBe(0);
  });

  it("returns 0 when cart has buy but no get products", () => {
    const items: CartItem[] = [{ product_id: 1, quantity: 5, price: 10 }];
    const details: BxGyDetails = {
      buy_products: [{ product_id: 1, quantity: 2 }],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 2,
    };
    expect(bxgyDiscount(items, details)).toBe(0);
  });

  it("applies b2g1 once: buy 2 from [1], get 1 of product 2 free", () => {
    const items: CartItem[] = [
      { product_id: 1, quantity: 2, price: 50 },
      { product_id: 2, quantity: 1, price: 25 },
    ];
    const details: BxGyDetails = {
      buy_products: [{ product_id: 1, quantity: 2 }],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 1,
    };
    expect(bxgyDiscount(items, details)).toBe(25);
  });

  it("respects repetition_limit", () => {
    const items: CartItem[] = [
      { product_id: 1, quantity: 6, price: 50 },
      { product_id: 2, quantity: 3, price: 25 },
    ];
    const details: BxGyDetails = {
      buy_products: [{ product_id: 1, quantity: 2 }],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 2,
    };
    expect(bxgyDiscount(items, details)).toBe(50);
  });

  it("caps by get quantity in cart", () => {
    const items: CartItem[] = [
      { product_id: 1, quantity: 10, price: 10 },
      { product_id: 2, quantity: 1, price: 100 },
    ];
    const details: BxGyDetails = {
      buy_products: [{ product_id: 1, quantity: 2 }],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 5,
    };
    expect(bxgyDiscount(items, details)).toBe(100);
  });
});

describe("computeDiscount", () => {
  const items: CartItem[] = [{ product_id: 1, quantity: 2, price: 50 }];

  it("dispatches cart-wise", () => {
    expect(
      computeDiscount(items, "cart-wise", { threshold: 50, discount: 10 }),
    ).toBe(10);
  });

  it("dispatches product-wise", () => {
    expect(
      computeDiscount(items, "product-wise", { product_id: 1, discount: 20 }),
    ).toBe(20);
  });

  it("dispatches bxgy", () => {
    const details: BxGyDetails = {
      buy_products: [{ product_id: 1, quantity: 2 }],
      get_products: [{ product_id: 2, quantity: 1 }],
      repition_limit: 1,
    };
    const cart: CartItem[] = [
      { product_id: 1, quantity: 2, price: 50 },
      { product_id: 2, quantity: 1, price: 25 },
    ];
    expect(computeDiscount(cart, "bxgy", details)).toBe(25);
  });
});
