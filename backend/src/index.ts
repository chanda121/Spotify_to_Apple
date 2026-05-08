import express from 'express'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import { redis, connectRedis } from './db/redis.js'

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

import spotifyUserRouter from './routes/spotify/user.js'
import spotifyAuthRouter from './routes/spotify/auth.js'
import spotifyPlayerRouter from './routes/spotify/player.js'

import appleAuthRouter from './routes/apple/auth.js'
import applePlaylistRouter from './routes/apple/playlist.js'

const app = express()

const port = process.env.PORT || 3000
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) throw new Error('SESSION_SECRET env var is not set')

try {
    await connectRedis()
} catch (err) {
    console.error('Could not connect to Redis!', err)
    process.exit(1)
}

const redisStore = new RedisStore({
    client: redis,
    prefix: 'spotifyToApple:',
    ttl: SESSION_TTL_SECONDS,
})

app.use(session({
    store: redisStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_TTL_SECONDS * 1000, //in milliseconds
    }
}))

app.use(express.json())

app.use('/api/spotify/user', spotifyUserRouter)
app.use('/api/spotify/auth', spotifyAuthRouter)
app.use('/api/spotify/player', spotifyPlayerRouter)

app.use('/api/apple/auth', appleAuthRouter)
app.use('/api/apple/playlists', applePlaylistRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})