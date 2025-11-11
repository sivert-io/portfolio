import { useState } from "react"

export function usePage() {
  const [currentPage, setCurrentPage] = useState<string>('home')
  const [isLoading, setIsLoading] = useState(true)

  return { currentPage, setCurrentPage, isLoading, setIsLoading }
}
