import { Request, Response } from 'express';
import Order from '../models/order.models';

export async function createOrder(req: Request, res: Response) {
  const order = new Order();

  order.events.push({ status: 'CREATION', timestamp: new Date() });
  await order.save();

  res.status(201).json(order);
}

export async function getOrders(req: Request, res: Response) {
  const orders = await Order.find()

  res.json(orders);
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params
  const { status } = req.body

  const FLOW = ['CREATION','PREPARATION','DISPATCH','DELIVERY']

  if (!FLOW.includes(status)) 
    return res.status(400).json({ error: 'Invalid status' })

  const order = await Order.findById(id)
  if (!order)
    return res.status(404).json({ error: 'Not found' })

  order.status = status
  order.updatedAt = new Date()
  order.events.push({ status, timestamp: new Date() })

  await order.save()

  res.json(order)
}
