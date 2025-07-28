import { Request, Response } from 'express';
import { getCache } from '../services/cache.service';
import { IOrder } from '../models/order.models';
import { KEY_LATE_PREP, KEY_UNDELIVERED } from '../services/alert.service';

export async function getAlerts(_: Request, res: Response) {
  try {
    const latePrep    = await getCache<IOrder[]>(KEY_LATE_PREP) ?? [];
    const undelivered = await getCache<IOrder[]>(KEY_UNDELIVERED) ?? [];

    return res.status(200).json({
      latePreparation: latePrep,
      undeliveredDispatch: undelivered
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({error: 'Failed to get alerts'});
  }
}
