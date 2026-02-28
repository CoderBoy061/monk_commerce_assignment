const COUPON_TYPES = ["cart-wise", "product-wise", "bxgy"] as const;

function isNumber(x: unknown): x is number {
  return typeof x === "number" && !Number.isNaN(x);
}

// returns error string or null if ok
export function validateCouponInput(body: unknown): string | null {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return "type and details are required";
  const b = body as Record<string, unknown>;
  if (!b.type || !b.details) return "type and details are required";
  if (
    typeof b.details !== "object" ||
    b.details === null ||
    Array.isArray(b.details)
  )
    return "details must be an object";
  const type = String(b.type);
  if (!COUPON_TYPES.includes(type as "cart-wise" | "product-wise" | "bxgy"))
    return "type must be cart-wise, product-wise, or bxgy";
  const d = b.details as Record<string, unknown>;

  if (type === "cart-wise") {
    if (!isNumber(d.threshold) || !isNumber(d.discount))
      return "cart-wise details require threshold and discount as numbers";
    return null;
  }
  if (type === "product-wise") {
    if (!isNumber(d.product_id) || !isNumber(d.discount))
      return "product-wise details require product_id and discount as numbers";
    return null;
  }
  if (type === "bxgy") {
    if (
      !Array.isArray(d.buy_products) ||
      !Array.isArray(d.get_products) ||
      !isNumber(d.repition_limit)
    )
      return "bxgy details require buy_products, get_products (arrays), and repition_limit (number)";
    const check = (arr: unknown[], name: string) => {
      for (let i = 0; i < arr.length; i++) {
        const o = arr[i];
        if (
          !o ||
          typeof o !== "object" ||
          !isNumber((o as Record<string, unknown>).product_id) ||
          !isNumber((o as Record<string, unknown>).quantity)
        )
          return `${name}[${i}] must have product_id and quantity as numbers`;
      }
      return null;
    };
    const buyErr = check(d.buy_products, "buy_products");
    if (buyErr) return buyErr;
    const getErr = check(d.get_products, "get_products");
    if (getErr) return getErr;
    return null;
  }
  return null;
}

export function validateCartItems(items: unknown): string | null {
  if (!Array.isArray(items)) return "cart.items must be an array";
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || typeof it !== "object" || Array.isArray(it))
      return `cart.items[${i}] must be an object with product_id, quantity, price`;
    const o = it as Record<string, unknown>;
    if (!isNumber(o.product_id))
      return `cart.items[${i}].product_id must be a number`;
    if (!isNumber(o.quantity) || (o.quantity as number) < 0)
      return `cart.items[${i}].quantity must be a non-negative number`;
    if (!isNumber(o.price) || (o.price as number) < 0)
      return `cart.items[${i}].price must be a non-negative number`;
  }
  return null;
}
