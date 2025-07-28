import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import alertRoutes from './routes/alert.routes';
import orderRoutes from './routes/order.routes';
import { connectRedis } from './services/cache.service';
import { startAlertsScheduler } from './services/alert.service';

dotenv.config();

async function bootstrap() {
  const app = express();

  app.use(express.json());
  app.use('/orders', orderRoutes);
  app.use('/alerts', alertRoutes);

  const port = process.env.PORT || 3000;

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB connected');

    await connectRedis();
    console.log('Redis connected');

    await startAlertsScheduler();
    console.log('Alerts scheduler started');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start services', err);
    process.exit(1);
  }
}

bootstrap();
