import { redisClient, connectRedis, setCache, getCache } from '../../src/services/cache.service';

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    isOpen: false,
    connect: jest.fn(),
    setEx: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    on: jest.fn()
  })
}));

describe('cache.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connectRedis', () => {
    it('should call connect when connection is closed', async () => {
      (redisClient as any).isOpen = false;
      await connectRedis();
      expect(redisClient.connect).toHaveBeenCalled();
    });

    it('should not call connect when connection is already open', async () => {
      (redisClient as any).isOpen = true;
      await connectRedis();
      expect(redisClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('setCache', () => {
    const key = 'test:key';
    const value = { foo: 'bar' };

    it('should use setEx when ttlSeconds is provided', async () => {
      await setCache(key, value, 60);
      expect(redisClient.setEx).toHaveBeenCalledWith(key, 60, JSON.stringify(value));
      expect(redisClient.set).not.toHaveBeenCalled();
    });

    it('should use set when ttlSeconds is not provided', async () => {
      await setCache(key, value);
      expect(redisClient.set).toHaveBeenCalledWith(key, JSON.stringify(value));
      expect(redisClient.setEx).not.toHaveBeenCalled();
    });
  });

  describe('getCache', () => {
    const key = 'test:key';

    it('should return parsed object when key exists', async () => {
      const stored = JSON.stringify({ hello: 'world' });
      (redisClient.get as jest.Mock).mockResolvedValueOnce(stored);

      const result = await getCache<any>(key);
      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toEqual({ hello: 'world' });
    });

    it('should return null when key does not exist', async () => {
      (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

      const result = await getCache<any>(key);
      expect(redisClient.get).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });
});
