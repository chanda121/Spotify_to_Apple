import crypto from 'crypto'

export const base64URLEncode = (str: Buffer): string => {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}
export const generateRandomString = (length: number): string => {
    return base64URLEncode(crypto.randomBytes(length)).slice(0, length)
}
export const generateCodeChallenge = (verifier: string): string => {
    const hashed = crypto.createHash('sha256').update(verifier).digest()
    return base64URLEncode(hashed)
}
