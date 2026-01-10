const express = require('express')
const createError = require('http-errors')
const session = require('express-session')

const healthRouter = require('./routes/health')
const userRouter = require('./routes/user')

const app = express()

const port = process.env.PORT || 3000

app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))


app.use('/api/health', healthRouter)
app.use('/api/user', userRouter)
app.get("/", (req, res) => {
    res.send('Hello World')
})

app.use((req, res, next) => {
    next(createError(404))
})
//error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json(err.status==404 ? {"error":{"message": "Not Found"}} : {"error":{"message": "Internal Server Error"}})
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`) 
})