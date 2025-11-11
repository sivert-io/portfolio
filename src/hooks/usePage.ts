import { create } from 'zustand'

type PageStoreState = {
  currentPage: string
  isLoading: boolean
  transitionStartedAt: number | null
  hasLoadedOnce: boolean
  setCurrentPage: (page: string) => void
  setIsLoading: (loading: boolean) => void
  navigateTo: (page: string) => void
  markContentReady: () => void
}

const SWIPE_COVER_DURATION = 220
const INITIAL_LOAD_DURATION = 1000
const TRANSITION_RELEASE_DELAY = 40
const TRANSITION_FAILSAFE_DURATION = 4000

let pageSwitchTimeout: ReturnType<typeof setTimeout> | null = null
let transitionReleaseTimeout: ReturnType<typeof setTimeout> | null = null
let readyReleaseTimeout: ReturnType<typeof setTimeout> | null = null

const usePageStore = create<PageStoreState>((set, get) => ({
  currentPage: 'home',
  isLoading: true,
  transitionStartedAt: Date.now(),
  hasLoadedOnce: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsLoading: (loading) =>
    set((state) => ({
      isLoading: loading,
      transitionStartedAt: loading ? Date.now() : null,
      hasLoadedOnce: state.hasLoadedOnce || !loading,
    })),
  navigateTo: (page) => {
    const { currentPage, isLoading, hasLoadedOnce } = get()
    const now = Date.now()
    const minimumDuration = hasLoadedOnce ? 0 : INITIAL_LOAD_DURATION

    if (page === currentPage) {
      if (!isLoading) {
        set((state) => ({
          isLoading: true,
          transitionStartedAt: now,
          hasLoadedOnce: state.hasLoadedOnce,
        }))
        if (transitionReleaseTimeout !== null) {
          clearTimeout(transitionReleaseTimeout)
        }
        if (readyReleaseTimeout !== null) {
          clearTimeout(readyReleaseTimeout)
          readyReleaseTimeout = null
        }
        transitionReleaseTimeout = setTimeout(() => {
          set({ isLoading: false, transitionStartedAt: null, hasLoadedOnce: true })
          transitionReleaseTimeout = null
        }, Math.max(minimumDuration, TRANSITION_FAILSAFE_DURATION))
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

    set((state) => ({
      isLoading: true,
      transitionStartedAt: now,
      hasLoadedOnce: state.hasLoadedOnce,
    }))

    pageSwitchTimeout = setTimeout(() => {
      set({ currentPage: page })
      pageSwitchTimeout = null
    }, SWIPE_COVER_DURATION)

    transitionReleaseTimeout = setTimeout(() => {
      set({ isLoading: false, transitionStartedAt: null, hasLoadedOnce: true })
      transitionReleaseTimeout = null
    }, TRANSITION_FAILSAFE_DURATION)
  },
  markContentReady: () => {
    const { isLoading, transitionStartedAt, hasLoadedOnce } = get()
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

    const minimumDuration = hasLoadedOnce ? 0 : INITIAL_LOAD_DURATION
    const startedAt = transitionStartedAt ?? Date.now()
    const elapsed = Date.now() - startedAt
    const waitForMinimum = Math.max(minimumDuration - elapsed, 0)

    readyReleaseTimeout = setTimeout(() => {
      set({ isLoading: false, transitionStartedAt: null, hasLoadedOnce: true })
      readyReleaseTimeout = null
    }, waitForMinimum + TRANSITION_RELEASE_DELAY)
  },
}))

export function usePage() {
  return usePageStore()
}
