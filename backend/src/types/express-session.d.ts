import 'express-session';

declare module 'express-session' {
  interface SessionData {
    spotify_token?: { 
        access_token: string,
        refresh_token: string,
        expires_in: number, //seconds
        expires_datetime: number //seconds
    }
    generatedState?: string
    codeVerifier?: string
  }
}