import type { Request, Response } from "express";
import type { ICoupon } from "../types/coupon.types";
import * as couponController from "../controllers/coupon-controller";
import { getMockRepo } from "./mocks/coupon-repository-mock";

jest.mock("../repositories/coupon-repository", () =>
  require("./mocks/coupon-repository-mock"),
);

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    body: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  res.send = jest.fn().mockReturnThis();
  return res;
}

describe("createCoupon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 201 and coupon when type and details are provided", async () => {
    const created: ICoupon = {
      _id: "id1",
      type: "cart-wise",
      details: { threshold: 100, discount: 10 },
    };
    getMockRepo().create.mockResolvedValue(created);
    const req = mockReq({
      body: { type: "cart-wise", details: { threshold: 100, discount: 10 } },
    });
    const res = mockRes();

    await couponController.createCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Coupon created successfully",
        coupon: created,
      }),
    );
  });

  it("returns 400 when type is missing", async () => {
    const req = mockReq({ body: { details: { threshold: 100 } } });
    const res = mockRes();

    await couponController.createCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "type and details are required",
    });
  });

  it("returns 400 when details is missing", async () => {
    const req = mockReq({ body: { type: "cart-wise" } });
    const res = mockRes();

    await couponController.createCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 500 when repository throws", async () => {
    getMockRepo().create.mockRejectedValue(new Error("db error"));
    const req = mockReq({
      body: { type: "cart-wise", details: { threshold: 100, discount: 10 } },
    });
    const res = mockRes();

    await couponController.createCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create coupon" });
  });
});

describe("getAllCoupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and list of coupons", async () => {
    const list: ICoupon[] = [
      { _id: "1", type: "cart-wise", details: { threshold: 0, discount: 0 } },
    ];
    getMockRepo().findAll.mockResolvedValue(list);
    const req = mockReq();
    const res = mockRes();

    await couponController.getAllCoupons(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Coupons fetched successfully",
        coupons: list,
      }),
    );
  });

  it("returns 500 when repository throws", async () => {
    getMockRepo().findAll.mockRejectedValue(new Error("db error"));
    const req = mockReq();
    const res = mockRes();

    await couponController.getAllCoupons(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("getCouponById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and coupon when found", async () => {
    const coupon: ICoupon = {
      _id: "id1",
      type: "product-wise",
      details: { product_id: 1, discount: 20 },
    };
    getMockRepo().findById.mockResolvedValue(coupon);
    const req = mockReq({ params: { id: "id1" } });
    const res = mockRes();

    await couponController.getCouponById(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Coupon fetched successfully",
        coupon,
      }),
    );
  });

  it("returns 404 when coupon not found", async () => {
    getMockRepo().findById.mockResolvedValue(null);
    const req = mockReq({ params: { id: "nonexistent" } });
    const res = mockRes();

    await couponController.getCouponById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Coupon not found" });
  });
});

describe("updateCoupon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and updated coupon when found", async () => {
    const updated: ICoupon = {
      _id: "id1",
      type: "cart-wise",
      details: { threshold: 150, discount: 15 },
    };
    getMockRepo().update.mockResolvedValue(updated);
    const req = mockReq({
      params: { id: "id1" },
      body: { details: { threshold: 150, discount: 15 } },
    });
    const res = mockRes();

    await couponController.updateCoupon(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Coupon updated successfully",
        coupon: updated,
      }),
    );
  });

  it("returns 404 when coupon not found", async () => {
    getMockRepo().update.mockResolvedValue(null);
    const req = mockReq({ params: { id: "bad" }, body: {} });
    const res = mockRes();

    await couponController.updateCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("deleteCoupon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns success and deleted true when deleted", async () => {
    getMockRepo().delete.mockResolvedValue(true);
    const req = mockReq({ params: { id: "id1" } });
    const res = mockRes();

    await couponController.deleteCoupon(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Coupon deleted successfully",
        deleted: true,
      }),
    );
  });

  it("returns 404 when coupon not found", async () => {
    getMockRepo().delete.mockResolvedValue(false);
    const req = mockReq({ params: { id: "bad" } });
    const res = mockRes();

    await couponController.deleteCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe("getApplicableCoupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when cart.items is missing", async () => {
    const req = mockReq({ body: {} });
    const res = mockRes();

    await couponController.getApplicableCoupons(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns 200 and applicable_coupons when cart has items", async () => {
    const coupons: ICoupon[] = [
      {
        _id: "c1",
        type: "cart-wise",
        details: { threshold: 50, discount: 10 },
        expiresAt: undefined,
      },
    ];
    getMockRepo().findAll.mockResolvedValue(coupons);
    const req = mockReq({
      body: { cart: { items: [{ product_id: 1, quantity: 2, price: 50 }] } },
    });
    const res = mockRes();

    await couponController.getApplicableCoupons(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        applicable_coupons: expect.arrayContaining([
          expect.objectContaining({
            coupon_id: "c1",
            type: "cart-wise",
            discount: 10,
          }),
        ]),
      }),
    );
  });
});

describe("applyCoupon", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when cart is missing or invalid", async () => {
    const req = mockReq({ params: { id: "id1" }, body: {} });
    const res = mockRes();

    await couponController.applyCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
    );
  });

  it("returns 404 when coupon not found", async () => {
    getMockRepo().findById.mockResolvedValue(null);
    const req = mockReq({
      params: { id: "bad" },
      body: { cart: { items: [{ product_id: 1, quantity: 1, price: 100 }] } },
    });
    const res = mockRes();

    await couponController.applyCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Coupon not found" });
  });

  it("returns 400 when coupon is expired", async () => {
    const past = new Date();
    past.setFullYear(past.getFullYear() - 1);
    const expired: ICoupon = {
      _id: "id1",
      type: "cart-wise",
      details: { threshold: 50, discount: 10 },
      expiresAt: past,
    };
    getMockRepo().findById.mockResolvedValue(expired);
    const req = mockReq({
      params: { id: "id1" },
      body: { cart: { items: [{ product_id: 1, quantity: 2, price: 50 }] } },
    });
    const res = mockRes();

    await couponController.applyCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Coupon has expired" });
  });

  it("returns 400 when coupon not applicable to cart", async () => {
    const notApplicable: ICoupon = {
      _id: "id1",
      type: "cart-wise",
      details: { threshold: 1000, discount: 10 },
      expiresAt: undefined,
    };
    getMockRepo().findById.mockResolvedValue(notApplicable);
    const req = mockReq({
      params: { id: "id1" },
      body: { cart: { items: [{ product_id: 1, quantity: 1, price: 50 }] } },
    });
    const res = mockRes();

    await couponController.applyCoupon(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Coupon is not applicable to this cart",
    });
  });

  it("returns 200 and updated_cart when coupon is applicable", async () => {
    const applicable: ICoupon = {
      _id: "id1",
      type: "cart-wise",
      details: { threshold: 50, discount: 10 },
      expiresAt: undefined,
    };
    getMockRepo().findById.mockResolvedValue(applicable);
    const req = mockReq({
      params: { id: "id1" },
      body: {
        cart: {
          items: [
            { product_id: 1, quantity: 2, price: 50 },
            { product_id: 2, quantity: 1, price: 30 },
          ],
        },
      },
    });
    const res = mockRes();

    await couponController.applyCoupon(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        updated_cart: expect.objectContaining({
          total_price: 130,
          total_discount: 13,
          final_price: 117,
          items: expect.any(Array),
        }),
      }),
    );
  });
});
