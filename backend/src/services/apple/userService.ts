import { AppleMusicAPIResponse, AppleMusicResource, AppleStorefrontAttributes } from '@shared/types/apple.js'
import { fetchWithAppleAuth } from '../AppleAPIClient.js'

export const getStorefront = async (devToken: string, mut: string): Promise<string | null> => {
    const url = 'https://api.music.apple.com/v1/me/storefront'
    const storefrontPayload = await fetchWithAppleAuth<AppleMusicAPIResponse<AppleMusicResource<AppleStorefrontAttributes>>>(devToken, mut, url)

    if (!storefrontPayload) return null

    return storefrontPayload.data[0].id
}