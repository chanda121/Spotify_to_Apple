import createError from 'http-errors'
import type { HttpError } from 'http-errors'
import type { Request, Response, NextFunction } from 'express'

export const notFoundHandler = (req: Request, _res: Response, _next: NextFunction) => {
    throw createError(404, `Was unable to find this URL: ${req.originalUrl}`)
}
export const errorHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err)
    let message = 'Internal Server Error'
    //if message is safe to expose, we pass along client error message
    if (err.expose) {
        message = err.message
    }
    res.status(err.status || 500).json(
        { error: { message: message } }
    )
}