require('dotenv').config({ path: './.env' });

const express = require('express')
const session = require('express-session')
const createError = require('http-errors')

const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')

const app = express()

const port = process.env.PORT || 3000

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)
app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use((req, res, next) => {
    next(createError(404))
})
//error handler
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.status || 500);
    res.json(err.status==404 ? { error: { message: 'Not Found' } } : { error: { message: 'Internal Server Error' } })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})