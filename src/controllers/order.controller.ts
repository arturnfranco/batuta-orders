import { Request, Response } from 'express';
import Order from '../models/order.models';
import { changeOrderStatus, UpdateResult } from '../services/order.service';

function buildGetOrdersFilter(status?: string, startDate?: string, endDate?: string): any {
  const filter: any = {};
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate)   filter.createdAt.$lte = new Date(endDate)
  }
  return filter;
}

export async function createOrder(_: Request, res: Response) {
  const order = new Order();

  order.events.push({ status: 'CREATION', timestamp: new Date() });
  await order.save();

  res.status(201).json(order);
}

export async function getOrders(req: Request, res: Response) {
  const { page, limit, status, startDate, endDate } = req.query as
    { page?: string; limit?: string; status?: string; startDate?: string; endDate?: string }

  const filter = buildGetOrdersFilter(status, startDate, endDate);

  try {
    const { docs, totalDocs, totalPages, page: currentPage } = await (Order as any).paginate(
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
        return res.status(400).json({ error: 'Invalid status' })
      case UpdateResult.NOT_FOUND:
        return res.status(404).json({ error: 'Order not found' })
      case UpdateResult.INVALID_TRANSITION:
        return res.status(400).json({ error: 'Invalid status transition' })
      case UpdateResult.NO_CHANGE:
        return res.status(200).json({ message: `Order already in ${status}` })
      case UpdateResult.UPDATED:
        return res.status(200).json(order)
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
