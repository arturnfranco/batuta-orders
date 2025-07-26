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
