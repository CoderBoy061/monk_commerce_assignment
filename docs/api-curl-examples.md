# API cURL – Import in Postman (Import → Raw text → paste)

Base URL: `http://localhost:5000`  
For full test cases and edge cases: **docs/TEST-CASES-AND-EDGE-CASES.md**

---

## 1. Create – Cart-wise (10% off when cart ≥ 100)

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"type": "cart-wise", "details": {"threshold": 100, "discount": 10}}'
```

---

## 2. Create – Product-wise (20% off Product A, product_id 4)

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"type": "product-wise", "details": {"product_id": 4, "discount": 20}}'
```

---

## 3. Create – BxGy (buy 2 from [1,2,3], get 1 from [4,5,6], limit 3)

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"type": "bxgy", "details": {"buy_products": [{"product_id": 1, "quantity": 2}], "get_products": [{"product_id": 4, "quantity": 1}], "repition_limit": 3}}'
```

---

## 4. Create – with expiry (optional)

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"type": "cart-wise", "details": {"threshold": 50, "discount": 5}, "expiresAt": "2026-12-31T23:59:59.000Z"}'
```

---

## 5. Get all coupons

```bash
curl --location 'http://localhost:5000/coupons'
```

---

## 6. Get coupon by ID (replace COUPON_ID)

```bash
curl --location 'http://localhost:5000/coupons/COUPON_ID'
```

---

## 7. Update coupon (replace COUPON_ID)

```bash
curl --location --request PUT 'http://localhost:5000/coupons/COUPON_ID' \
--header 'Content-Type: application/json' \
--data '{"details": {"threshold": 150, "discount": 15}}'
```

---

## 8. Delete coupon (replace COUPON_ID)

```bash
curl --location --request DELETE 'http://localhost:5000/coupons/COUPON_ID'
```

---

## 9. Applicable coupons (which coupons apply for a cart and discount amount)

```bash
curl --location 'http://localhost:5000/applicable-coupons' \
--header 'Content-Type: application/json' \
--data '{"cart": {"items": [{"product_id": 1, "quantity": 6, "price": 50}, {"product_id": 2, "quantity": 3, "price": 30}, {"product_id": 3, "quantity": 2, "price": 25}]}}'
```

---

## 10. Apply coupon (replace COUPON_ID)

```bash
curl --location 'http://localhost:5000/apply-coupon/COUPON_ID' \
--header 'Content-Type: application/json' \
--data '{"cart": {"items": [{"product_id": 1, "quantity": 6, "price": 50}, {"product_id": 2, "quantity": 3, "price": 30}, {"product_id": 3, "quantity": 2, "price": 25}]}}'
```

---

## Edge cases (take the curl and paste it in postman)

### E1. Empty cart – applicable coupons

**Expected:** 200, `applicable_coupons` empty or only coupons that don’t depend on cart total (e.g. cart-wise will not apply).

```bash
curl --location 'http://localhost:5000/applicable-coupons' \
--header 'Content-Type: application/json' \
--data '{"cart": {"items": []}}'
```

---

### E2. Missing cart body – 400 Bad Request

**Expected:** 400, error message like "cart.items array is required".

```bash
curl --location 'http://localhost:5000/applicable-coupons' \
--header 'Content-Type: application/json' \
--data '{}'
```

---

### E3. Missing cart in apply-coupon – 400

**Expected:** 400.

```bash
curl --location 'http://localhost:5000/apply-coupon/COUPON_ID' \
--header 'Content-Type: application/json' \
--data '{}'
```

---

### E4. Invalid coupon ID – 404 Not Found

**Expected:** 404, "Coupon not found". (Uses a non-existent MongoDB ObjectId.)

```bash
curl --location 'http://localhost:5000/apply-coupon/000000000000000000000000' \
--header 'Content-Type: application/json' \
--data '{"cart": {"items": [{"product_id": 1, "quantity": 2, "price": 50}]}}'
```

---

### E5. Get coupon by invalid ID – 404

**Expected:** 404, "Coupon not found".

```bash
curl --location 'http://localhost:5000/coupons/000000000000000000000000'
```

---

### E6. Update coupon invalid ID – 404

**Expected:** 404.

```bash
curl --location --request PUT 'http://localhost:5000/coupons/000000000000000000000000' \
--header 'Content-Type: application/json' \
--data '{"details": {"threshold": 200, "discount": 20}}'
```

---

### E7. Delete coupon invalid ID – 404

**Expected:** 404.

```bash
curl --location --request DELETE 'http://localhost:5000/coupons/000000000000000000000000'
```

---

### E8. Create coupon – missing type (400)

**Expected:** 400, "type and details are required" (or similar).

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"details": {"threshold": 100, "discount": 10}}'
```

---

### E9. Create coupon – missing details (400)

**Expected:** 400.

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"type": "cart-wise"}'
```

---

### E10. Apply cart-wise when cart below threshold – 400

Replace `COUPON_ID` with a **cart-wise** coupon `_id`. Cart total = 80 (< 100).

**Expected:** 400, "Coupon is not applicable to this cart".

```bash
curl --location 'http://localhost:5000/apply-coupon/COUPON_ID' \
--header 'Content-Type: application/json' \
--data '{"cart": {"items": [{"product_id": 1, "quantity": 1, "price": 50}, {"product_id": 2, "quantity": 1, "price": 30}]}}'
```

---

### E11. Create expired coupon (for E12)

**Expected:** 201, coupon with `expiresAt` in the past. Copy the returned `_id` for E12.

```bash
curl --location 'http://localhost:5000/coupons' \
--header 'Content-Type: application/json' \
--data '{"type": "cart-wise", "details": {"threshold": 100, "discount": 10}, "expiresAt": "2020-01-01T00:00:00.000Z"}'
```

---

### E12. Apply expired coupon – 400

Use the `_id` from E11 response (or any coupon you created with past `expiresAt`).

**Expected:** 400, "Coupon has expired".

```bash
curl --location 'http://localhost:5000/apply-coupon/COUPON_ID' \
--header 'Content-Type: application/json' \
--data '{"cart": {"items": [{"product_id": 1, "quantity": 2, "price": 50}]}}'
```

---
