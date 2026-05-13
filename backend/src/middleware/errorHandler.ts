import { inspect } from 'node:util'
import createError from 'http-errors'
import type { HttpError } from 'http-errors'
import type { Request, Response, NextFunction } from 'express'

const debugErrorShape = (err: HttpError): void => {
    const snapshot = {
        constructorName: Object.getPrototypeOf(err)?.constructor?.name,
        name: err.name,
        message: err.message,
        status: err.status,
        statusCode: err.statusCode,
        expose: err.expose,
        headers: err.headers,
        ownPropertyNames: Object.getOwnPropertyNames(err),
        cause: Object.hasOwn(err, 'cause') ? err.cause : undefined,
    }
    console.error('[errorHandler] snapshot:', snapshot)
    console.error('[errorHandler] inspect:', inspect(err, { depth: 8, colors: false, getters: false }))
}

export const notFoundHandler = (req: Request, _res: Response, _next: NextFunction) => {
    throw createError(404, `Was unable to find this URL: ${req.originalUrl}`)
}
export const errorHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    debugErrorShape(err)
    let message = 'Internal Server Error'
    //if message is safe to expose, we pass along client error message
    if (err.expose) {
        message = err.message
    }
    res.status(err.status || 500).json(
        { error: { message: message } }
    )
}