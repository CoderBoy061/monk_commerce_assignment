import { CouponRepository } from "../repositories/coupon-repository";
import { CouponModel } from "../models/coupon-schema";

const mockExec = jest.fn();
const mockLean = jest.fn().mockReturnValue({ exec: mockExec });

jest.mock("../models/coupon-schema", () => ({
  CouponModel: {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({ lean: () => mockLean() }),
    findById: jest.fn().mockReturnValue({ lean: () => mockLean() }),
    findByIdAndUpdate: jest.fn().mockReturnValue({ lean: () => mockLean() }),
    findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn() }),
  },
}));

const mockCouponModel = CouponModel as jest.Mocked<typeof CouponModel>;

describe("CouponRepository", () => {
  let repo: CouponRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new CouponRepository();
  });

  describe("create", () => {
    it("creates and returns coupon with string _id", async () => {
      const doc = {
        _id: "507f1f77bcf86cd799439011",
        type: "cart-wise",
        details: { threshold: 100, discount: 10 },
        expiresAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockCouponModel.create.mockResolvedValue(doc as never);

      const result = await repo.create({
        type: "cart-wise",
        details: { threshold: 100, discount: 10 },
      });

      expect(result._id).toBe("507f1f77bcf86cd799439011");
      expect(result.type).toBe("cart-wise");
      expect(result.details).toEqual({ threshold: 100, discount: 10 });
      expect(mockCouponModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "cart-wise",
          details: { threshold: 100, discount: 10 },
        }),
      );
    });
  });

  describe("findAll", () => {
    it("returns array of coupons", async () => {
      const docs = [
        {
          _id: "1",
          type: "cart-wise",
          details: {},
          expiresAt: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];
      mockExec.mockResolvedValueOnce(docs);

      const result = await repo.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe("1");
      expect(result[0].type).toBe("cart-wise");
    });
  });

  describe("findById", () => {
    it("returns null when not found", async () => {
      mockExec.mockResolvedValueOnce(null);

      const result = await repo.findById("id1");

      expect(result).toBeNull();
    });

    it("returns coupon when found", async () => {
      const doc = {
        _id: "id1",
        type: "product-wise",
        details: { product_id: 1, discount: 20 },
      };
      mockExec.mockResolvedValueOnce(doc);

      const result = await repo.findById("id1");

      expect(result).not.toBeNull();
      expect(result!._id).toBe("id1");
    });
  });

  describe("update", () => {
    it("returns null when coupon not found", async () => {
      mockExec.mockResolvedValueOnce(null);

      const result = await repo.update("id1", {
        details: { threshold: 200, discount: 15 },
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("returns false when nothing deleted", async () => {
      mockCouponModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      } as never);

      const result = await repo.delete("id1");

      expect(result).toBe(false);
    });

    it("returns true when document deleted", async () => {
      mockCouponModel.findByIdAndDelete.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: "id1" }),
      } as never);

      const result = await repo.delete("id1");

      expect(result).toBe(true);
    });
  });
});
