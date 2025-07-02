import redis from '../config/redis';

export const setCache = async (key: string, value: any, ttlSeconds = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error('❌ Redis SET Error:', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Redis GET Error:', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('❌ Redis DEL Error:', error);
  }
};
