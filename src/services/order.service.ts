import Order from '../models/order.models';

export enum UpdateResult {
  NOT_FOUND,
  INVALID_STATUS,
  INVALID_TRANSITION,
  NO_CHANGE,
  UPDATED
}

const FLOW = ['CREATION','PREPARATION','DISPATCH','DELIVERY'] as const;

export async function changeOrderStatus(
  id: string,
  status: any
): Promise<{ result: UpdateResult; order?: any }> {

  if (!FLOW.includes(status)) {
    return { result: UpdateResult.INVALID_STATUS };
  }

  const order = await Order.findById(id);
  if (!order) {
    return { result: UpdateResult.NOT_FOUND };
  }

  const currentIdx = FLOW.indexOf(order.status);
  const newIdx     = FLOW.indexOf(status);

  if (newIdx === currentIdx) {
    return { result: UpdateResult.NO_CHANGE };
  } else if (newIdx < currentIdx || newIdx === -1) {
    return { result: UpdateResult.INVALID_TRANSITION };
  } else {
    const prevStatus = FLOW[newIdx - 1];
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
