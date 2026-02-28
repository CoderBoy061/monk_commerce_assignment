import type { Request, Response } from "express";
import { CouponRepository } from "../repositories/coupon-repository";
import type { CouponInput, ProductWiseDetails } from "../types/coupon.types";
import { isCartWise, isProductWise, isBxGy } from "../types/coupon.types";
import type {
  CartPayload,
  CartItem,
  CartItemWithDiscount,
  UpdatedCart,
} from "../types/cart.types";
import type {
  ApplicableCouponsResponse,
  ApplicableCouponItem,
  ApplyCouponResponse,
} from "../types/api.types";
import {
  cartTotal,
  isExpired,
  computeDiscount,
} from "../services/coupon-discount";
import { logger } from "../utils/logger";
import {
  validateCouponInput,
  validateCartItems,
} from "../utils/request-validation";

const couponRepo = new CouponRepository();

export async function createCoupon(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CouponInput;
    const validationError = validateCouponInput(body);
    if (validationError) {
      logger.warn("create coupon validation failed", {
        error: validationError,
      });
      res.status(400).json({ error: validationError });
      return;
    }
    const coupon = await couponRepo.create(body);
    logger.info("coupon created", { couponId: coupon._id, type: coupon.type });
    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (err) {
    logger.error("Failed to create coupon", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to create coupon" });
  }
}

export async function getAllCoupons(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const coupons = await couponRepo.findAll();
    logger.info("list coupons ok", { count: coupons.length });
    res.json({
      message: "Coupons fetched successfully",
      coupons,
    });
  } catch (err) {
    logger.error("Failed to fetch coupons", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
}

export async function getCouponById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!id) {
      logger.warn("get by id - missing id");
      res.status(400).json({ error: "coupon id is required" });
      return;
    }
    const coupon = await couponRepo.findById(id);
    if (!coupon) {
      logger.warn("coupon not found", { id });
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    logger.info("coupon fetched", { id });
    res.json({
      message: "Coupon fetched successfully",
      coupon,
    });
  } catch (err) {
    logger.error("Failed to fetch coupon", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
}

export async function updateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!id) {
      logger.warn("update - missing id");
      res.status(400).json({ error: "coupon id is required" });
      return;
    }
    const body = req.body as Partial<CouponInput>;
    const coupon = await couponRepo.update(id, body);
    if (!coupon) {
      logger.warn("update - not found", { id });
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    logger.info("coupon updated", { id, type: coupon.type });
    res.json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (err) {
    logger.error("Failed to update coupon", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to update coupon" });
  }
}

export async function deleteCoupon(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    if (!id) {
      logger.warn("delete - missing id");
      res.status(400).json({ error: "coupon id is required" });
      return;
    }
    const deleted = await couponRepo.delete(id);
    if (!deleted) {
      logger.warn("delete - not found", { id });
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    logger.info("coupon deleted", { id });
    res.json({
      message: "Coupon deleted successfully",
      deleted,
    });
  } catch (err) {
    logger.error("Failed to delete coupon", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to delete coupon" });
  }
}

export async function getApplicableCoupons(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { cart } = req.body as CartPayload;
    if (!cart || typeof cart !== "object") {
      logger.warn("applicable coupons - cart required");
      res.status(400).json({ error: "cart with items array is required" });
      return;
    }
    const itemsError = validateCartItems(cart.items);
    if (itemsError) {
      logger.warn("applicable coupons - bad cart items", { error: itemsError });
      res.status(400).json({ error: itemsError });
      return;
    }
    const items = cart.items as CartItem[];
    const all = await couponRepo.findAll();
    const applicable_coupons: ApplicableCouponItem[] = [];
    for (const c of all) {
      if (isExpired(c.expiresAt)) continue;
      const discount = computeDiscount(items, c.type, c.details);
      if (discount > 0) {
        applicable_coupons.push({ coupon_id: c._id, type: c.type, discount });
      }
    }
    logger.info("applicable coupons done", {
      cartItems: items.length,
      count: applicable_coupons.length,
    });
    const response: ApplicableCouponsResponse = { applicable_coupons };
    res.json(response);
  } catch (err) {
    logger.error("Failed to compute applicable coupons", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to compute applicable coupons" });
  }
}

export async function applyCoupon(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { cart } = req.body as CartPayload;
    if (!id) {
      logger.warn("apply - coupon id required");
      res.status(400).json({ error: "coupon id is required" });
      return;
    }
    if (!req.body || typeof req.body.cart !== "object") {
      logger.warn("apply - cart required");
      res.status(400).json({ error: "cart with items array is required" });
      return;
    }
    const payload = req.body as CartPayload;
    const itemsError = validateCartItems(payload.cart?.items);
    if (itemsError) {
      logger.warn("apply - invalid cart items", { error: itemsError });
      res.status(400).json({ error: itemsError });
      return;
    }
    const items = payload.cart!.items as CartItem[];
    const coupon = await couponRepo.findById(id);
    if (!coupon) {
      logger.warn("Apply coupon: coupon not found", { id });
      res.status(404).json({ error: "Coupon not found" });
      return;
    }
    if (isExpired(coupon.expiresAt)) {
      logger.warn("Apply coupon: coupon expired", { id });
      res.status(400).json({ error: "Coupon has expired" });
      return;
    }
    const totalDiscount = computeDiscount(items, coupon.type, coupon.details);
    if (totalDiscount <= 0) {
      logger.warn("apply - not applicable", { id, type: coupon.type });
      res.status(400).json({ error: "Coupon is not applicable to this cart" });
      return;
    }

    const total_price = cartTotal(items);
    const itemsWithDiscount: CartItemWithDiscount[] = items.map((i) => ({
      ...i,
      total_discount: 0,
    }));

    if (isCartWise(coupon.details)) {
      if (total_price > 0) {
        for (let i = 0; i < itemsWithDiscount.length; i++) {
          const lineTotal = items[i].quantity * items[i].price;
          itemsWithDiscount[i].total_discount =
            (lineTotal / total_price) * totalDiscount;
        }
      }
    } else if (isProductWise(coupon.details)) {
      const idx = items.findIndex(
        (i) =>
          i.product_id === (coupon.details as ProductWiseDetails).product_id,
      );
      if (idx >= 0) itemsWithDiscount[idx].total_discount = totalDiscount;
    } else if (isBxGy(coupon.details)) {
      const getIds = new Set(
        coupon.details.get_products.map((g) => g.product_id),
      );
      const getRequired = coupon.details.get_products.reduce(
        (s, g) => s + g.quantity,
        0,
      );
      const buyRequired = coupon.details.buy_products.reduce(
        (s, b) => s + b.quantity,
        0,
      );
      const buyIds = new Set(
        coupon.details.buy_products.map((b) => b.product_id),
      );
      let buyCount = 0;
      for (const i of items)
        if (buyIds.has(i.product_id)) buyCount += i.quantity;
      const applications = Math.min(
        Math.floor(buyCount / buyRequired),
        coupon.details.repition_limit,
      );
      let remaining = applications * getRequired;
      for (let i = 0; i < itemsWithDiscount.length && remaining > 0; i++) {
        if (!getIds.has(items[i].product_id)) continue;
        const take = Math.min(items[i].quantity, remaining);
        const unitPrice = items[i].price;
        itemsWithDiscount[i].total_discount = take * unitPrice;
        remaining -= take;
      }
    }

    const updated_cart: UpdatedCart = {
      items: itemsWithDiscount,
      total_price,
      total_discount: totalDiscount,
      final_price: total_price - totalDiscount,
    };
    logger.info("coupon applied", {
      id,
      type: coupon.type,
      totalDiscount,
      finalPrice: updated_cart.final_price,
    });
    const response: ApplyCouponResponse = { updated_cart };
    res.json(response);
  } catch (err) {
    logger.error("Failed to apply coupon", {
      error: err instanceof Error ? err.message : String(err),
    });
    res.status(500).json({ error: "Failed to apply coupon" });
  }
}
