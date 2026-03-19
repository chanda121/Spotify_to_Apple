import createError from 'http-errors'
import type { HttpError } from 'http-errors'
import type { Request, Response, NextFunction } from 'express'

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    console.log(`404 for ${req.originalUrl}`)
    next(createError(404))
}
export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(err.status || 500).json(err.status === 404
        ? { error: { message: 'Not Found' } }
        : { error: { message: 'Internal Server Error' } }
    )
}