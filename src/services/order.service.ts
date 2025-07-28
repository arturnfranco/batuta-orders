import Order, { IOrder } from '../models/order.models';
import { isValidStatus, getIndex, getPrevStatus } from '../utils/order-status';

export enum UpdateResult {
  NOT_FOUND,
  INVALID_STATUS,
  INVALID_TRANSITION,
  NO_CHANGE,
  UPDATED
}

export async function changeOrderStatus(
  id: string,
  status: any
): Promise<{ result: UpdateResult; order?: IOrder }> {

  if (!isValidStatus(status)) return { result: UpdateResult.INVALID_STATUS };

  const order = await Order.findById(id);
  if (!order) return { result: UpdateResult.NOT_FOUND };

  const currentIdx = getIndex(order.status);
  const newIdx     = getIndex(status);

  if (newIdx === currentIdx) {
    return { result: UpdateResult.NO_CHANGE };
  } else if (newIdx < currentIdx || newIdx === -1) {
    return { result: UpdateResult.INVALID_TRANSITION };
  } else {
    const prevStatus = getPrevStatus(status);
    const updated = await Order.findOneAndUpdate(
      {
        _id: id, status: prevStatus, 'events.status': { $ne: status }
      },
      {
        $addToSet: { events: { status, timestamp: new Date() } },
        $set: { status, updatedAt: new Date() }
      }
    );

    if (!updated) return { result: UpdateResult.INVALID_TRANSITION };
  
    return { result: UpdateResult.UPDATED, order: updated };
  }
}
