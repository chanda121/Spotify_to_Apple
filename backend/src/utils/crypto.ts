import crypto from 'crypto'

type JWTPayload = Record<string, string | number | undefined | (string | undefined)[]>

export const base64URLEncode = (str: Buffer): string => {
    return str.toString('base64url')
}

export const serializeJSON = (json: JWTPayload): Buffer => {
    return Buffer.from(JSON.stringify(json))
}

const getApplePrivateKey = (): string => {
    const key = process.env.APPLE_PRIVATE_KEY

    if (!key) throw new Error('Internal Server Error: Apple Private Key is missing from environment.')

    return key.replace(/\\n/g, '\n')
}

export const createJWT = (header: JWTPayload, claims: JWTPayload) => {
    const encodedHeader = base64URLEncode(serializeJSON(header))
    const encodedClaims = base64URLEncode(serializeJSON(claims))

    const dataToSign = `${encodedHeader}.${encodedClaims}`

    const sign = crypto.createSign('SHA256')
    sign.update(dataToSign)
    sign.end()

    const sig = sign.sign(({
        key: getApplePrivateKey(),
        dsaEncoding: 'ieee-p1363'
    }))
    const encodedSig = base64URLEncode(sig)

    return `${dataToSign}.${encodedSig}`

}

export const generateRandomString = (length: number): string => {
    return base64URLEncode(crypto.randomBytes(length)).slice(0, length)
}
export const generateCodeChallenge = (verifier: string): string => {
    const hashed = crypto.createHash('sha256').update(verifier).digest()
    return base64URLEncode(hashed)
}
