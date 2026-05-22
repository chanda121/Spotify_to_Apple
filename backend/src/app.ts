import express from 'express'
import type { RequestHandler } from 'express'

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

import spotifyUserRouter from './routes/spotify/user.js'
import spotifyAuthRouter from './routes/spotify/auth.js'
import spotifyPlayerRouter from './routes/spotify/player.js'

import appleAuthRouter from './routes/apple/auth.js'
import applePlaylistRouter from './routes/apple/playlist.js'


type CreateAppOptions = {
    sessionMiddleware?: RequestHandler
}

export function createApp(options: CreateAppOptions = {}) {
    const app = express()

    app.use(express.json())
    if (options.sessionMiddleware) {
        app.use(options.sessionMiddleware)
    }

    app.use('/api/spotify/user', spotifyUserRouter)
    app.use('/api/spotify/auth', spotifyAuthRouter)
    app.use('/api/spotify/player', spotifyPlayerRouter)

    app.use('/api/apple/auth', appleAuthRouter)
    app.use('/api/apple/playlists', applePlaylistRouter)

    app.use(notFoundHandler)
    app.use(errorHandler)

    return app
}
