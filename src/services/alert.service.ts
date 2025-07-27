import cron from 'node-cron';
import dayjs from 'dayjs';
import Order, { IOrder } from '../models/order.models';

interface AlertsCache {
  latePreparation: IOrder[],
  undeliveredDispatch: IOrder[],
}

const alertsCache: AlertsCache = {
  latePreparation: [],
  undeliveredDispatch: []
};

async function checkAlerts() {
  const warehouseLimitDays = +process.env.WAREHOUSE_LIMIT_DAYS!;
  const threeDaysAgo = dayjs().subtract(warehouseLimitDays, 'day').toDate();

  await Order.find({
    status: 'CREATION',
    createdAt: { $lt: threeDaysAgo }
  }).then(latePrep => {
    alertsCache.latePreparation = latePrep;
  });

  const todayEnd = dayjs().endOf('day').toDate();
  await Order.find({
    status: 'DISPATCH',
    updatedAt: { $lt: todayEnd }
  }).then(undelivered => {
    alertsCache.undeliveredDispatch = undelivered;
  });
}

export async function startAlertsScheduler() {
  cron.schedule('* * * * *', async () => { // running every minute
    console.log('Checking alerts...');
    await checkAlerts();
  });
  await checkAlerts();
}

export function getAlertsCache() {
  return alertsCache;
}
