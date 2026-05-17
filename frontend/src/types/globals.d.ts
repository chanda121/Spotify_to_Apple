interface MusicKitConfiguration {
    developerToken: string,
    app: {
        name: string,
        build?: string
    }
}

interface MusicKitInstance {
    isAuthorized: boolean,
    authorize: () => Promise<string | void>,
    unauthorize: () => Promise<void>
}

declare global {
    interface Window {
        MusicKit?: {
            configure: (config: MusicKitConfiguration) => Promise<MusicKitInstance>
            getInstance: () => MusicKitInstance
        }
    }
}

export {}