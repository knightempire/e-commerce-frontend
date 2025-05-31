"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCartStore } from "@/lib/cart-store"
import {
  Heart,
  Star,
  ShoppingCart,
  Search,
  Filter,
  Grid,
  List,
  User,
  RefreshCw,
  Info,
  Loader2,
} from "lucide-react"
import { OfferBanner } from "@/components/offer-banner"
import { ProductFilters } from "@/components/product-filters"
import { useProducts } from "@/hooks/useProducts"
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll"
import type { SearchParams } from "@/lib/api"

// Set a fixed page size constant for pagination
const PAGE_SIZE = 40

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
const [showAlert, setShowAlert] = useState(false)
const [alertMessage, setAlertMessage] = useState("")

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartCount } = useCartStore()

  // Pass num: PAGE_SIZE to load 40 products per page
  const { products, loading, error, hasMore, loadMore, search, refresh, totalResults } = useProducts({
    q: "electronics",
    num: PAGE_SIZE,
  })

  // Infinite scroll hook using fixed PAGE_SIZE
  useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
    threshold: 200,
  })

  // Fix: use num: PAGE_SIZE for search to fetch 40 products
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    search({ q: query || "electronics", num: PAGE_SIZE })
  }

  // Fix: pass num: PAGE_SIZE for filters search
  const handleFiltersChange = (filters: SearchParams) => {
    search({
      ...filters,
      q: searchQuery || "electronics",
      num: PAGE_SIZE,
    })
  }

  const toggleWishlist = async (product: any) => {
    const productId = product.product_id
    setLoadingStates((prev) => ({ ...prev, [`wishlist-${productId}`]: true }))

    await new Promise((resolve) => setTimeout(resolve, 500))

    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(product)
    }

    setLoadingStates((prev) => ({ ...prev, [`wishlist-${productId}`]: false }))
  }

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

const showCustomAlert = (message: string) => {
  setAlertMessage(message)
  setShowAlert(true)

  // Hide the alert after 3 seconds
  setTimeout(() => {
    setShowAlert(false)
  }, 3000)
}

const handleAddToCart = async (product: any) => {
  const productId = product.product_id
  setLoadingStates((prev) => ({ ...prev, [`cart-${productId}`]: true }))

  await new Promise((resolve) => setTimeout(resolve, 500))

  addToCart(product, 1)
  showCustomAlert("Added to cart!")  // Use the new custom alert function

  setLoadingStates((prev) => ({ ...prev, [`cart-${productId}`]: false }))
}

  const formatPrice = (price: string) => {
    const match = price.match(/[\d,]+\.?\d*/g)
    if (match) {
      return `$${match[0]}`
    }
    return price
  }

  // Filter unique products with price > 0
  const uniqueProducts = Array.from(
    new Map(
      products
        .filter((product) => {
          // Extract numeric price for comparison; fallback to 0 if unavailable or unparsable
          const numericPrice = parseFloat(product.price.replace(/[^0-9\.]+/g, "")) || 0
          return numericPrice > 0
        })
        .map((product) => [product.product_id, product])
    ).values()
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push("/")}>
              AudioStore
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/offers")} className="text-orange-600 font-medium">
                🔥 Offers
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/saved")}>
                <Heart className="h-5 w-5" />
                {useCartStore.getState().wishlistItems.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {useCartStore.getState().wishlistItems.length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
                <ShoppingCart className="h-5 w-5" />
                {getCartCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{getCartCount()}</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <OfferBanner />
    {showAlert && (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="bg-green-500 text-white">
          <Info className="h-4 w-4" />
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      </div>
    )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => handleSearch(searchQuery)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>

            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <ProductFilters onFiltersChange={handleFiltersChange} loading={loading} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {totalResults > 0
                  ? `Showing ${uniqueProducts.length} of ${totalResults} products`
                  : `${uniqueProducts.length} products found`}
              </p>
              {error && (
                <Alert className="w-auto">
                  <Info className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Products Grid */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {uniqueProducts.map((product) => (
                <Card
                  key={product.product_id}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-300 group ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div className={`relative ${viewMode === "list" ? "w-48" : "aspect-square"} overflow-hidden`}>
                    <Image
                      src={product.thumbnail || "/placeholder.svg"}
                      alt={product.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => handleProductClick(product.product_id)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.extracted_price > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {product.source}
                        </Badge>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleWishlist(product)
                      }}
                      disabled={loadingStates[`wishlist-${product.product_id}`]}
                    >
                      {loadingStates[`wishlist-${product.product_id}`] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart
                          className={`h-4 w-4 ${
                            isInWishlist(product.product_id) ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      )}
                    </Button>
                  </div>

                  <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="space-y-2">
                      <h3
                        className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                        onClick={() => handleProductClick(product.product_id)}
                      >
                        {product.title}
                      </h3>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{formatPrice(product.price)}</span>
                        {product.brand && (
                          <Badge variant="outline" className="text-xs">
                            {product.brand}
                          </Badge>
                        )}
                      </div>

                      {/* Delivery Info */}
                      {product.delivery && <p className="text-sm text-muted-foreground">{product.delivery}</p>}

                      {/* Quick Actions */}
                      <div className={`flex gap-2 pt-2 ${viewMode === "list" ? "flex-wrap" : ""}`}>
                        <Button
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleProductClick(product.product_id)
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                          disabled={loadingStates[`cart-${product.product_id}`]}
                        >
                          {loadingStates[`cart-${product.product_id}`] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShoppingCart className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Loading Skeletons */}
              {loading && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <Card key={`skeleton-${i}`} className={viewMode === "list" ? "flex" : ""}>
                      <div className={`${viewMode === "list" ? "w-48" : "aspect-square"}`}>
                        <Skeleton className="w-full h-full" />
                      </div>
                      <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>

            {/* Load More Button */}
            {!loading && hasMore && uniqueProducts.length > 0 && (
              <div className="text-center mt-8">
                <Button onClick={loadMore} variant="outline" size="lg">
                  Load More Products
                </Button>
              </div>
            )}

            {/* No Results */}
            {!loading && uniqueProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">No products found</p>
                <Button onClick={() => handleSearch("electronics")} variant="outline">
                  Show All Products
                </Button>
              </div>
            )}

            {/* End of Results */}
            {!loading && !hasMore && uniqueProducts.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You've reached the end of the results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    
  )
}

