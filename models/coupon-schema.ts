import mongoose, { Schema, Model } from "mongoose";
import type { CouponType, CouponDetails } from "../types/coupon.types";

export interface ICouponDocument {
  _id: mongoose.Types.ObjectId;
  type: CouponType;
  details: CouponDetails;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    type: {
      type: String,
      enum: ["cart-wise", "product-wise", "bxgy"] as CouponType[],
      required: true,
    },
    details: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: false },
  },
  { timestamps: true },
);

export const CouponModel: Model<ICouponDocument> =
  mongoose.models.Coupon ??
  mongoose.model<ICouponDocument>("Coupon", CouponSchema);
