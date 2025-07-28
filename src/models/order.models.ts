import { Schema, model, Document, PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { STATUSES, Status } from '../utils/order-status';

export interface IOrder extends Document {
  status: Status,
  createdAt: Date,
  updatedAt: Date,
  events: { status: Status; timestamp: Date }[]
}

const OrderSchema = new Schema<IOrder>({
  status: {
    type: String,
    enum: STATUSES,
    default: STATUSES[0]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  events: [
    {
      status: { type: String, enum: STATUSES },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

OrderSchema.plugin(mongoosePaginate);

const Order = model<IOrder, PaginateModel<IOrder>>('Order', OrderSchema);

export default Order;
