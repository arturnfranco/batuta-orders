import request from 'supertest';
import express, { Router } from 'express';
import { createOrder, getOrders, updateOrderStatus } from '../../src/controllers/order.controller';
import Order from '../../src/models/order.models';
import { changeOrderStatus, UpdateResult } from '../../src/services/order.service';
import { STATUSES } from '../../src/utils/order-status';

jest.mock('../../src/models/order.models');
jest.mock('../../src/services/order.service');

const app = express();
app.use(express.json());

const router = Router();

router.post('/orders', createOrder);
router.get('/orders', getOrders);
router.patch('/orders/:id/status', updateOrderStatus);
app.use(router);

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order with CREATION event', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      (Order as any).mockImplementation(() => ({
        events: [],
        save: mockSave
      }));

      const res = await request(app).post('/orders').send();

      expect(res.status).toBe(201);
      expect(res.body.events).toHaveLength(1);
      expect(res.body.events[0].status).toBe(STATUSES[0]);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const fakeDocs = [{ _id: '1' }, { _id: '2' }];
      (Order as any).paginate = jest.fn().mockResolvedValue({
        docs: fakeDocs,
        totalDocs: 2,
        totalPages: 1,
        page: 1,
        limit: 10
      });

      const res = await request(app).get('/orders?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(fakeDocs);
      expect(res.body.meta.total).toBe(2);
      expect((Order as any).paginate).toHaveBeenCalledWith({}, { page: 1, limit: 10, sort: { createdAt: -1 } });
    });
  });

  describe('updateOrderStatus', () => {
    it('should return 400 on INVALID_STATUS', async () => {
      (changeOrderStatus as jest.Mock).mockResolvedValue({ result: UpdateResult.INVALID_STATUS });
      const res = await request(app).patch('/orders/1/status').send({ status: 'X' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid status');
    });

    it('should return 404 on NOT_FOUND', async () => {
      (changeOrderStatus as jest.Mock).mockResolvedValue({ result: UpdateResult.NOT_FOUND });
      const res = await request(app).patch('/orders/1/status').send({ status: STATUSES[0] });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Order not found');
    });

    it('should return 400 on INVALID_TRANSITION', async () => {
      (changeOrderStatus as jest.Mock).mockResolvedValue({ result: UpdateResult.INVALID_TRANSITION });
      const res = await request(app).patch('/orders/1/status').send({ status: STATUSES[0] });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid status transition');
    });

    it('should return 200 with message on NO_CHANGE', async () => {
      ;(changeOrderStatus as jest.Mock).mockResolvedValue({ result: UpdateResult.NO_CHANGE });
      const res = await request(app).patch('/orders/1/status').send({ status: STATUSES[0] });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Order already in');
    });

    it('should return order on UPDATED', async () => {
      const fakeOrder = { _id: '1', status: STATUSES[1], events: [] };
      (changeOrderStatus as jest.Mock).mockResolvedValue({ result: UpdateResult.UPDATED, order: fakeOrder });
      const res = await request(app).patch('/orders/1/status').send({ status: STATUSES[1] });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeOrder);
    });
  });
});
