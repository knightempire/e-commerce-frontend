"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star, Package } from "lucide-react"

export default function SavedPage() {
  const router = useRouter()
  const { wishlistItems, removeFromWishlist, moveToCart, addToCart } = useCartStore()

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Saved for Later</h1>
            <Badge variant="secondary">{wishlistItems.length} items</Badge>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          /* Empty Wishlist */
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No saved items</h2>
            <p className="text-muted-foreground mb-6">Items you save for later will appear here</p>
            <Button onClick={() => router.push("/")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Saved Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.product_id} className="group hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleProductClick(item.product_id)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=300"
                      }}
                    />

                    {/* Source Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.source}
                      </Badge>
                    </div>

                    {/* Remove from Wishlist */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromWishlist(item.product_id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Product Title - Clickable */}
                      <h3
                        className="font-semibold text-lg line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleProductClick(item.product_id)}
                      >
                        {item.title}
                      </h3>

                      {/* Rating */}
                      {item.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(item.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.rating} ({item.reviews})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{formatPrice(item.extracted_price)}</span>
                        {item.brand && (
                          <Badge variant="outline" className="text-xs">
                            {item.brand}
                          </Badge>
                        )}
                      </div>

                      {/* Delivery Info */}
                      {item.delivery && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {item.delivery}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button className="flex-1" onClick={() => moveToCart(item.product_id)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Move to Cart
                        </Button>
                        <Button variant="outline" onClick={() => handleProductClick(item.product_id)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bulk Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      wishlistItems.forEach((item) => moveToCart(item.product_id))
                    }}
                    disabled={wishlistItems.length === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Move All to Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm("Are you sure you want to remove all saved items?")) {
                        wishlistItems.forEach((item) => removeFromWishlist(item.product_id))
                      }
                    }}
                    disabled={wishlistItems.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>You might also like</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Browse our catalog to discover more products you'll love</p>
                  <Button className="mt-4" onClick={() => router.push("/")}>
                    Explore Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
