import { Schema, model, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IOrder extends Document {
  status: 'CREATION' | 'PREPARATION' | 'DISPATCH' | 'DELIVERY',
  createdAt: Date,
  updatedAt: Date,
  events: { status: IOrder['status']; timestamp: Date }[]
}

const OrderSchema = new Schema<IOrder>({
  status: {
    type: String,
    enum: ['CREATION','PREPARATION','DISPATCH','DELIVERY'],
    default: 'CREATION'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  events: [
    {
      status: { type: String, enum: ['CREATION','PREPARATION','DISPATCH','DELIVERY'] },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

OrderSchema.plugin(mongoosePaginate);

export default model<IOrder>('Order', OrderSchema);
