import request from 'supertest';
import express, { Router } from 'express';
import { getAlerts } from '../../src/controllers/alert.controller';
import { getCache } from '../../src/services/cache.service';

jest.mock('../../src/services/cache.service');

const app = express();
app.use(express.json());
const router = Router();
router.get('/alerts', getAlerts);
app.use(router);

const mockGetCache = getCache as jest.Mock;

describe('Alert Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /alerts should return current cache with 200', async () => {
    const fakeCacheLatePrep = [{ _id: '1' }];
    const fakeCacheUndelivered = [{ _id: '2' }];
    
    mockGetCache
      .mockResolvedValueOnce(fakeCacheLatePrep)
      .mockResolvedValueOnce(fakeCacheUndelivered);

    const res = await request(app).get('/alerts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      latePreparation: fakeCacheLatePrep,
      undeliveredDispatch: fakeCacheUndelivered
    })
    expect(getCache).toHaveBeenCalledTimes(2);
  });

  it('GET /alerts should return 500 on exception', async () => {
    mockGetCache.mockImplementation(() => {
      throw new Error('redis down')
    });

    const res = await request(app).get('/alerts');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to get alerts' });
  });
});
