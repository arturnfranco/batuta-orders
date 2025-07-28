import cron from 'node-cron';
import dayjs from 'dayjs';
import Order, { IOrder } from '../models/order.models';
import { setCache } from './cache.service';

export const KEY_LATE_PREP   = 'alerts:latePreparation';
export const KEY_UNDELIVERED = 'alerts:undeliveredDispatch';

async function checkAlerts() {
  const redisTTLSeconds = +process.env.REDIS_TTL_SECONDS!;
  const warehouseLimitDays = +process.env.WAREHOUSE_LIMIT_DAYS!;
  const threeDaysAgo = dayjs().subtract(warehouseLimitDays, 'day').toDate();

  const latePrep = await Order.find({
    status: { $in: ['CREATION', 'PREPARATION'] },
    createdAt: { $lt: threeDaysAgo }
  });

  await setCache<IOrder[]>(KEY_LATE_PREP, latePrep, redisTTLSeconds);

  const todayEnd = dayjs().endOf('day').toDate();
  const undelivered = await Order.find({
    status: 'DISPATCH',
    updatedAt: { $lt: todayEnd }
  });
  await setCache<IOrder[]>(KEY_UNDELIVERED, undelivered, redisTTLSeconds);
}

export async function startAlertsScheduler() {
  cron.schedule('* * * * *', async () => { // running every minute
    console.log('Checking alerts...');
    await checkAlerts();
  });
  await checkAlerts();
}
