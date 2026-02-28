const create = jest.fn();
const findAll = jest.fn();
const findById = jest.fn();
const update = jest.fn();
const deleteFn = jest.fn();

const mockInstance = {
  create,
  findAll,
  findById,
  update,
  delete: deleteFn,
};

export const CouponRepository = jest.fn(() => mockInstance);

export function getMockRepo() {
  return mockInstance;
}
