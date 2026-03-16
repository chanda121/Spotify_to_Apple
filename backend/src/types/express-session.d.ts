import 'express-session';

declare module 'express-session' {
  interface SessionData {
    spotify_token?: { 
        accessToken: string,
        refreshToken: string,
        expiresIn: number, //milliseconds
        expiresDatetime: number //milliseconds
    }
    generatedState?: string
    codeVerifier?: string
  }
}