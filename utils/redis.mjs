import redis from 'redis';

class RedisClient {
    constructor() {
        this.client = redis.createClient();
        this.client.on('error', (err) => {
            console.log('Redis client not connected to the server:', err);
        });
    }

    isAlive() {
        return this.client.isConnected();
    }

    async get(key) {
        return await this.client.get(key);
    }

    async set(key, value, duration) {
        return await this.client.set(key, value, 'EX', duration);
    }

    async del(key) {
        return await this.client.del(key);
    }
}

const redisClient = new RedisClient();

export default redisClient;