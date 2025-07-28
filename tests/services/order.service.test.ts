import { changeOrderStatus, UpdateResult } from '../../src/services/order.service';
import Order, { IOrder } from '../../src/models/order.models';

jest.mock('../../src/models/order.models');

const mockOrder = Order as jest.Mocked<typeof Order>;

describe.only('changeOrderStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return INVALID_STATUS for an invalid status', async () => {
    const res = await changeOrderStatus('any-id', 'INVALID');
    expect(res.result).toBe(UpdateResult.INVALID_STATUS);
  });

  it('should return NOT_FOUND when Order.findById returns null', async () => {
    mockOrder.findById.mockResolvedValueOnce(null);
    const res = await changeOrderStatus('123', 'CREATION');
    expect(res.result).toBe(UpdateResult.NOT_FOUND);
    expect(mockOrder.findById).toHaveBeenCalledWith('123');
  });

  it('should return NO_CHANGE when status is unchanged', async () => {
    const existing: Partial<IOrder> = { status: 'PREPARATION', events: [] };
    mockOrder.findById.mockResolvedValueOnce(existing as IOrder);
    const res = await changeOrderStatus('123', 'PREPARATION');
    expect(res.result).toBe(UpdateResult.NO_CHANGE);
  });

  it('should return INVALID_TRANSITION for backward transition', async () => {
    const existing: Partial<IOrder> = { status: 'DISPATCH', events: [] };
    mockOrder.findById.mockResolvedValueOnce(existing as IOrder);
    const res = await changeOrderStatus('123', 'PREPARATION');
    expect(res.result).toBe(UpdateResult.INVALID_TRANSITION);
  });

  it('should return UPDATED with the updated order', async () => {
    const existing: Partial<IOrder> = { status: 'CREATION', events: [] };
    const updated: Partial<IOrder> = {
      status: 'PREPARATION',
      events: [{ status: 'PREPARATION', timestamp: new Date() }]
    };
    mockOrder.findById.mockResolvedValueOnce(existing as IOrder);
    mockOrder.findOneAndUpdate.mockResolvedValueOnce(updated as IOrder);

    const res = await changeOrderStatus('123', 'PREPARATION');
    expect(res.result).toBe(UpdateResult.UPDATED);
    expect(res.order).toEqual(updated);
  });
});
