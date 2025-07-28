import { createClient } from 'redis';

export const redisClient = createClient({ url: process.env.REDIS_URL! });

redisClient.on('error', err => console.error('Redis Client Error', err));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds?: number) {
  const str = JSON.stringify(value);
  if (ttlSeconds) {
    await redisClient.setEx(key, ttlSeconds, str);
  } else {
    await redisClient.set(key, str);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const str = await redisClient.get(key);
  return str ? JSON.parse(str) as T : null;
}
