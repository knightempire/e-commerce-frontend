"use client"

import { useState, useEffect, useCallback } from "react"
import { productAPI, type Product, type SearchParams } from "@/lib/api"

export interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  search: (params: SearchParams) => void
  refresh: () => void
  totalResults: number
}

const PAGE_SIZE = 40

export function useProducts(initialParams: SearchParams = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentParams, setCurrentParams] = useState<SearchParams>(initialParams)
  const [totalResults, setTotalResults] = useState(0)
  const [page, setPage] = useState(0)

  const loadProducts = useCallback(
    async (params: SearchParams, append = false, pageIndex: number = 0) => {
      setLoading(true)
      setError(null)

      try {
        const response = await productAPI.searchProducts({
          ...params,
          start: pageIndex * PAGE_SIZE,
          num: PAGE_SIZE,
        })

        if (append) {
          setProducts((prev) => [...prev, ...response.products])
        } else {
          setProducts(response.products)
        }

        setTotalResults(response.search_metadata.total_results || 0)
        setHasMore(response.products.length === PAGE_SIZE)

        if (response.error) {
          setError(response.error)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load products"
        setError(errorMessage)
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const search = useCallback(
    (params: SearchParams) => {
      setCurrentParams(params)
      setPage(0)
      loadProducts(params, false, 0)
    },
    [loadProducts],
  )

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadProducts(currentParams, true, nextPage)
    }
  }, [loading, hasMore, page, currentParams, loadProducts])

  const refresh = useCallback(() => {
    setPage(0)
    setError(null)
    loadProducts(currentParams, false, 0)
  }, [currentParams, loadProducts])

  useEffect(() => {
    loadProducts(initialParams, false, 0)
  }, []) // Only run once on mount

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    search,
    refresh,
    totalResults,
  }
}
