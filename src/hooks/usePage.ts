import { useState } from "react"

export function usePage() {
  const [currentPage, setCurrentPage] = useState<string>('home')

  return { currentPage, setCurrentPage }
}
