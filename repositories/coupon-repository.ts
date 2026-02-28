import type { CouponInput, ICoupon } from "../types/coupon.types";
import { CouponModel } from "../models/coupon-schema";
import { logger } from "../utils/logger";

export class CouponRepository {
  async create(data: CouponInput): Promise<ICoupon> {
    const doc = await CouponModel.create({
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });
    const coupon = this.toCoupon(doc);
    logger.info("repo: coupon created", { id: coupon._id, type: coupon.type });
    return coupon;
  }

  async findAll(): Promise<ICoupon[]> {
    const docs = await CouponModel.find().lean().exec();
    const coupons = docs.map((d) => this.toCoupon(d));
    logger.info("repo: list coupons", { count: coupons.length });
    return coupons;
  }

  async findById(id: string): Promise<ICoupon | null> {
    const doc = await CouponModel.findById(id).lean().exec();
    if (doc) {
      logger.info("repo: found", { id });
      return this.toCoupon(doc);
    }
    return null;
  }

  async update(
    id: string,
    data: Partial<CouponInput>,
  ): Promise<ICoupon | null> {
    const update: Record<string, unknown> = { ...data };
    if (data.expiresAt !== undefined) {
      update.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }
    const doc = await CouponModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    )
      .lean()
      .exec();
    if (doc) {
      logger.info("repo: updated", { id });
      return this.toCoupon(doc);
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CouponModel.findByIdAndDelete(id).exec();
    if (result != null) {
      logger.info("repo: deleted", { id });
      return true;
    }
    return false;
  }

  // mongoose doc -> our coupon shape
  private toCoupon(doc: {
    _id: unknown;
    type: string;
    details: unknown;
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): ICoupon {
    return {
      _id: String(doc._id),
      type: doc.type as ICoupon["type"],
      details: doc.details as ICoupon["details"],
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
