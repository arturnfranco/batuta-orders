import Order from '../models/order.models';
import { Status, isValidStatus, getIndex, getPrevStatus } from '../utils/order-status';

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
): Promise<{ result: UpdateResult; order?: any }> {

  if (!isValidStatus(status)) {
    return { result: UpdateResult.INVALID_STATUS };
  }

  const order = await Order.findById(id);
  if (!order) {
    return { result: UpdateResult.NOT_FOUND };
  }

  const currentIdx = getIndex(order.status);
  const newIdx     = getIndex(status);

  if (newIdx === currentIdx) {
    return { result: UpdateResult.NO_CHANGE };
  } else if (newIdx < currentIdx || newIdx === -1) {
    return { result: UpdateResult.INVALID_TRANSITION };
  } else {
    const prevStatus = getPrevStatus(status);
    await Order.updateOne(
      {
        _id: id, status: prevStatus, 'events.status': { $ne: status }
      },
      {
        $addToSet: { events: { status, timestamp: new Date() } },
        $set: { status, updatedAt: new Date() }
      }
    );
    const updated = await Order.findById(id);
    return { result: UpdateResult.UPDATED, order: updated };
  }
}
