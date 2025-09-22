import Bull from 'bull';
import redisClient from './redis.mjs';

const fileQueue = new Bull('fileQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

export default fileQueue;
