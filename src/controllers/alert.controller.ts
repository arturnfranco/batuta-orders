import { Request, Response } from 'express';
import { getAlertsCache } from '../services/alert.service';

export function getAlerts(_: Request, res: Response) {
  try {
    const alerts = getAlertsCache();

    return res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({error: 'Failed to get alerts'});
  }
}
