import 'express-session';

declare module 'express-session' {
  interface SessionData {
    spotifyToken?: { 
        accessToken: string,
        refreshToken: string,
        expiresIn: number, //milliseconds
        expiresDatetime: number //milliseconds
    }
    generatedState?: string
    codeVerifier?: string
    appleDevToken?: string
    appleMusicUserToken?: string
    appleStorefront?: string
  }
}