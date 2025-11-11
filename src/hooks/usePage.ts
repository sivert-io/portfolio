import { create } from 'zustand'

type PageStoreState = {
  currentPage: string
  isLoading: boolean
  transitionStartedAt: number | null
  setCurrentPage: (page: string) => void
  setIsLoading: (loading: boolean) => void
  navigateTo: (page: string) => void
  markContentReady: () => void
}

const SWIPE_COVER_DURATION = 350
const MIN_LOADING_DURATION = 900
const CONTENT_RELEASE_DELAY = 150
const TRANSITION_FAILSAFE_DURATION = 4000

let pageSwitchTimeout: ReturnType<typeof setTimeout> | null = null
let transitionReleaseTimeout: ReturnType<typeof setTimeout> | null = null
let readyReleaseTimeout: ReturnType<typeof setTimeout> | null = null

const usePageStore = create<PageStoreState>((set, get) => ({
  currentPage: 'home',
  isLoading: true,
  transitionStartedAt: Date.now(),
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) => set({ isLoading: loading, transitionStartedAt: loading ? Date.now() : null }),
  navigateTo: (page) => {
    const { currentPage, isLoading } = get()
    const now = Date.now()
    if (page === currentPage) {
      if (!isLoading) {
        set({ isLoading: true, transitionStartedAt: now })
        if (transitionReleaseTimeout !== null) {
          clearTimeout(transitionReleaseTimeout)
        }
        if (readyReleaseTimeout !== null) {
          clearTimeout(readyReleaseTimeout)
          readyReleaseTimeout = null
        }
        transitionReleaseTimeout = setTimeout(() => {
          set({ isLoading: false, transitionStartedAt: null })
          transitionReleaseTimeout = null
        }, TRANSITION_FAILSAFE_DURATION)
      }
      return
    }

    if (pageSwitchTimeout !== null) {
      clearTimeout(pageSwitchTimeout)
      pageSwitchTimeout = null
    }
    if (transitionReleaseTimeout !== null) {
      clearTimeout(transitionReleaseTimeout)
      transitionReleaseTimeout = null
    }
    if (readyReleaseTimeout !== null) {
      clearTimeout(readyReleaseTimeout)
      readyReleaseTimeout = null
    }

    set({ isLoading: true, transitionStartedAt: now })

    pageSwitchTimeout = setTimeout(() => {
      set({ currentPage: page })
      pageSwitchTimeout = null
    }, SWIPE_COVER_DURATION)

    transitionReleaseTimeout = setTimeout(() => {
      set({ isLoading: false, transitionStartedAt: null })
      transitionReleaseTimeout = null
    }, TRANSITION_FAILSAFE_DURATION)
  },
  markContentReady: () => {
    const { isLoading, transitionStartedAt } = get()
    if (!isLoading) {
      return
    }

    if (transitionReleaseTimeout !== null) {
      clearTimeout(transitionReleaseTimeout)
      transitionReleaseTimeout = null
    }
    if (readyReleaseTimeout !== null) {
      clearTimeout(readyReleaseTimeout)
      readyReleaseTimeout = null
    }

    const startedAt = transitionStartedAt ?? Date.now()
    const elapsed = Date.now() - startedAt
    const waitForMinimum = Math.max(MIN_LOADING_DURATION - elapsed, 0)

    readyReleaseTimeout = setTimeout(() => {
      set({ isLoading: false, transitionStartedAt: null })
      readyReleaseTimeout = null
    }, waitForMinimum + CONTENT_RELEASE_DELAY)
  },
}))

export function usePage() {
  return usePageStore()
}
