import express from 'express'
import session from 'express-session'

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

import spotifyUserRouter from './routes/spotify/user.js'
import spotifyAuthRouter from './routes/spotify/auth.js'
import spotifyPlayerRouter from './routes/spotify/player.js'

import appleAuthRouter from './routes/apple/auth.js'

const app = express()

const port = process.env.PORT || 3000

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) throw new Error('SESSION_SECRET env var is not set')

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use('/api/spotify/user', spotifyUserRouter)
app.use('/api/spotify/auth', spotifyAuthRouter)
app.use('/api/spotify/player', spotifyPlayerRouter)

app.use('/api/apple/auth', appleAuthRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})