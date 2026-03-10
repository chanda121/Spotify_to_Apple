import express from 'express'
import session from 'express-session'
import createError, { HttpError } from 'http-errors'

import userRouter from './routes/user.js'
import authRouter from './routes/auth.js'
import spotifyPlayerRouter from './routes/spotifyPlayer.js'

import type { Response, Request, NextFunction } from 'express'

const app = express()

const port = process.env.PORT || 3000

const sessionSecret = process.env.SESSION_SECRET
if(!sessionSecret) throw new Error('SESSION_SECRET env var is not set')

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/spotify-player', spotifyPlayerRouter)

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World')
})

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`404 for ${req.originalUrl}`)
    next(createError(404))
})
//error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(err.status || 500);
    res.json(err.status==404 ? { error: { message: 'Not Found' } } : { error: { message: 'Internal Server Error' } })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})