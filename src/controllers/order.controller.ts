import { Request, Response } from 'express';
  import Order, { IOrder } from '../models/order.models';
import { changeOrderStatus, UpdateResult } from '../services/order.service';
import { FilterQuery } from 'mongoose';
import { STATUSES } from '../utils/order-status';

function buildGetOrdersFilter(status?: string, startDate?: string, endDate?: string): FilterQuery<IOrder> {
  const filter: FilterQuery<IOrder> = {};
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)   filter.createdAt.$lte = new Date(endDate);
  }
  return filter;
}

export async function createOrder(_: Request, res: Response) {
  const order = new Order();

  order.events.push({ status: STATUSES[0], timestamp: new Date() });
  await order.save();

  res.status(201).json(order);
}

export async function getOrders(req: Request, res: Response) {
  const { status, startDate, endDate } = req.query as
    { status?: string; startDate?: string; endDate?: string };
  
  const page  = parseInt((req.query.page as string) || '1',  10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const filter = buildGetOrdersFilter(status, startDate, endDate);

  try {
    const { docs, totalDocs, totalPages, page: currentPage } = await Order.paginate(
      filter, { page, limit, sort: {createdAt: -1}}
    );

    return res.json({
      data: docs,
      meta: { total: totalDocs, pages: totalPages, page: currentPage, limit }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { result, order } = await changeOrderStatus(id, status);

    switch (result) {
      case UpdateResult.INVALID_STATUS:
        return res.status(400).json({ error: 'Invalid status' });
      case UpdateResult.NOT_FOUND:
        return res.status(404).json({ error: 'Order not found' });
      case UpdateResult.INVALID_TRANSITION:
        return res.status(400).json({ error: 'Invalid status transition' });
      case UpdateResult.NO_CHANGE:
        return res.status(200).json({ message: `Order already in ${status}` });
      case UpdateResult.UPDATED:
        return res.status(200).json(order);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
