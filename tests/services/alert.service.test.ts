import cron from 'node-cron';
import { startAlertsScheduler } from '../../src/services/alert.service';
import { setCache } from '../../src/services/cache.service';
import Order, { IOrder } from '../../src/models/order.models';

jest.mock('../../src/models/order.models');
jest.mock('../../src/services/cache.service');
jest.mock('node-cron');

const mockOrder = Order as jest.Mocked<typeof Order>;
const mockSchedule = cron.schedule as jest.Mock;
const mockSetCache = setCache as jest.Mock;

describe('alert.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WAREHOUSE_LIMIT_DAYS = '3';
    mockSchedule.mockReturnValue({} as any);
  })

  it('should fetch orders and sets cache correctly on start', async () => {
    const latePrepOrders = [{ _id: '1' }] as IOrder[];
    const undeliveredOrders = [{ _id: '2' }] as IOrder[];

    mockOrder.find
      .mockResolvedValueOnce(latePrepOrders)
      .mockResolvedValueOnce(undeliveredOrders);

    await startAlertsScheduler();

    expect(mockSetCache).toHaveBeenCalledWith(
      'alerts:latePreparation',
      latePrepOrders,
      expect.any(Number)
    );
    expect(mockSetCache).toHaveBeenCalledWith(
      'alerts:undeliveredDispatch',
      undeliveredOrders,
      expect.any(Number)
    );

    expect(cron.schedule).toHaveBeenCalledWith('* * * * *', expect.any(Function));
  });
});
