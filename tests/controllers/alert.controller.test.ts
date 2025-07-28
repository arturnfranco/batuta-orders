import request from 'supertest';
import express, { Router } from 'express';
import { getAlerts } from '../../src/controllers/alert.controller';
import * as alertService from '../../src/services/alert.service';

jest.mock('../../src/services/alert.service');

const app = express();
app.use(express.json());
const router = Router();
router.get('/alerts', getAlerts);
app.use(router);

describe('Alert Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /alerts should return current cache with 200', async () => {
    const fakeCache = {
      latePreparation: [{ _id: '1' }],
      undeliveredDispatch: [{ _id: '2' }]
    };
    (alertService.getAlertsCache as jest.Mock).mockReturnValue(fakeCache);

    const res = await request(app).get('/alerts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fakeCache);
    expect(alertService.getAlertsCache).toHaveBeenCalled();
  });

  it('GET /alerts should return 500 on exception', async () => {
    (alertService.getAlertsCache as jest.Mock).mockImplementation(() => {
      throw new Error('cache miss');
    });

    const res = await request(app).get('/alerts');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to get alerts' });
  });
})
