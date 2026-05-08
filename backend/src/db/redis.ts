import { createClient } from 'redis'

const url = process.env.REDIS_URL
if (!url) throw new Error('REDIS_URL env var is not set')

export const redis = createClient({
    url,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
    }
})

redis.on('error', (err) => console.error('Redis client error:', err))
redis.on('ready', () => console.log('Redis ready'))

export const connectRedis = async () => {
    if (!redis.isOpen) await redis.connect()
}