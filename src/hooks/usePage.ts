import { create } from 'zustand'

type PageStoreState = {
  currentPage: string
  isLoading: boolean
  hasLoadedOnce: boolean
  setCurrentPage: (page: string) => void
  navigateTo: (page: string) => void
  markContentReady: () => void
}

const usePageStore = create<PageStoreState>((set, get) => ({
  currentPage: 'home',
  isLoading: true,
  hasLoadedOnce: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  navigateTo: (page) => {
    const { currentPage } = get()
    if (page === currentPage) {
      return
    }
    set({ currentPage: page })
  },
  markContentReady: () => {
    const { isLoading, hasLoadedOnce } = get()
    if (!isLoading) {
      return
    }
    if (!hasLoadedOnce) {
      set({ isLoading: false, hasLoadedOnce: true })
      return
    }
    set({ isLoading: false })
  },
}))

export function usePage() {
  return usePageStore()
}
