import { startAlertsScheduler, getAlertsCache } from '../../src/services/alert.service';
import Order, { IOrder } from '../../src/models/order.models';
import cron from 'node-cron';

jest.mock('../../src/models/order.models');
jest.mock('node-cron');

const mockOrder = Order as jest.Mocked<typeof Order>;
const mockSchedule = cron.schedule as jest.Mock;

describe('alert.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WAREHOUSE_LIMIT_DAYS = '3';
    mockSchedule.mockReturnValue({} as any);
  })

  it('should populate alertsCache correctly on start', async () => {
    const latePrepOrders = [{ _id: '1' }] as IOrder[];
    const undeliveredOrders = [{ _id: '2' }] as IOrder[];

    mockOrder.find
      .mockResolvedValueOnce(latePrepOrders)
      .mockResolvedValueOnce(undeliveredOrders);

    await startAlertsScheduler();

    const cache = getAlertsCache();
    expect(cache.latePreparation).toEqual(latePrepOrders);
    expect(cache.undeliveredDispatch).toEqual(undeliveredOrders);

    expect(mockOrder.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        status: { $in: ['CREATION', 'PREPARATION'] },
        createdAt: { $lt: expect.any(Date) }
      }) 
    );

    expect(mockOrder.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        status: 'DISPATCH',
        updatedAt: { $lt: expect.any(Date) }
      })
    );

    expect(cron.schedule).toHaveBeenCalledWith('* * * * *', expect.any(Function));
  });
});
