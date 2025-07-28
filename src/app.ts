import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import alertRoutes from './routes/alert.routes';
import orderRoutes from './routes/order.routes';
import { startAlertsScheduler } from './services/alert.service';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/orders', orderRoutes);
app.use('/alerts', alertRoutes);

app.listen(process.env.PORT, async () => {
  console.log(`Server on port ${process.env.PORT}`);
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('MongoDB connected');

  await startAlertsScheduler();
});
