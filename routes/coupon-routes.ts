import { Router } from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getApplicableCoupons,
  applyCoupon,
} from "../controllers/coupon-controller";

const router = Router();

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;

/** Separate router for applicable-coupons and apply-coupon (POST with body). */
export const couponApplyRouter = Router();
couponApplyRouter.post("/applicable-coupons", getApplicableCoupons);
couponApplyRouter.post("/apply-coupon/:id", applyCoupon);
