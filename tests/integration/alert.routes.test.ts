import request from 'supertest';
import express from 'express';
import alertRouter from '../../src/routes/alert.routes';
import { getAlerts } from '../../src/controllers/alert.controller';

jest.mock('../../src/controllers/alert.controller');

const app = express();
app.use(express.json());
app.use('/alerts', alertRouter);

describe('Alert Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /alerts should call getAlerts handler', async () => {
    (getAlerts as jest.Mock).mockImplementation((_, res) => res.sendStatus(200));

    const res = await request(app).get('/alerts');
    expect(getAlerts).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
