import request from 'supertest';
import express from 'express';
import orderRouter from '../../src/routes/order.routes';
import * as orderController from '../../src/controllers/order.controller';

jest.mock('../../src/controllers/order.controller')

const app = express();
app.use(express.json());
app.use('/orders', orderRouter);

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /orders should call createOrder', async () => {
    (orderController.createOrder as jest.Mock).mockImplementation((_, res) => res.sendStatus(201));

    const res = await request(app).post('/orders').send({});
    expect(orderController.createOrder).toHaveBeenCalled();
    expect(res.status).toBe(201);
  });

  it('GET /orders should call getOrders', async () => {
    (orderController.getOrders as jest.Mock).mockImplementation((_, res) => res.sendStatus(200));

    const res = await request(app).get('/orders');
    expect(orderController.getOrders).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('PATCH /orders/:id/status should call updateOrderStatus', async () => {
    ;(orderController.updateOrderStatus as jest.Mock).mockImplementation((_, res) => res.sendStatus(204));

    const res = await request(app).patch('/orders/123/status').send({ status: 'CREATION' });
    expect(orderController.updateOrderStatus).toHaveBeenCalled();
    expect(res.status).toBe(204);
  });
});
