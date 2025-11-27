declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react'

  interface UseRegisterSWOptions {
    immediate?: boolean
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: unknown) => void
  }

  interface UseRegisterSWReturn {
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>]
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }

  export function useRegisterSW(options?: UseRegisterSWOptions): UseRegisterSWReturn
}
