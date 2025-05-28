"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Star, ShoppingCart, Search, Filter, Grid, List, Zap, Gift, Truck, User } from 'lucide-react'
import { OfferBanner } from "@/components/offer-banner"

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "Experience crystal-clear audio with active noise cancellation",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewCount: 2847,
    image: "/placeholder.svg?height=300&width=300",
    category: "headphones",
    isOnSale: true,
    isBestSeller: true,
    inStock: 47,
  },
  {
    id: 2,
    name: "Wireless Earbuds Pro",
    description: "Compact design with premium sound quality",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.6,
    reviewCount: 1523,
    image: "/placeholder.svg?height=300&width=300",
    category: "earbuds",
    isOnSale: true,
    isBestSeller: false,
    inStock: 23,
  },
  {
    id: 3,
    name: "Premium Bluetooth Speaker",
    description: "360-degree sound with deep bass",
    price: 149.99,
    originalPrice: 199.99,
    rating: 4.7,
    reviewCount: 892,
    image: "/placeholder.svg?height=300&width=300",
    category: "speakers",
    isOnSale: true,
    isBestSeller: false,
    inStock: 15,
  },
  {
    id: 4,
    name: "Studio Monitor Headphones",
    description: "Professional-grade audio for creators",
    price: 399.99,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 456,
    image: "/placeholder.svg?height=300&width=300",
    category: "headphones",
    isOnSale: false,
    isBestSeller: true,
    inStock: 8,
  },
  {
    id: 5,
    name: "Gaming Headset RGB",
    description: "Immersive gaming audio with RGB lighting",
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.4,
    reviewCount: 1234,
    image: "/placeholder.svg?height=300&width=300",
    category: "gaming",
    isOnSale: true,
    isBestSeller: false,
    inStock: 32,
  },
  {
    id: 6,
    name: "Portable Mini Speaker",
    description: "Compact speaker for on-the-go music",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.3,
    reviewCount: 678,
    image: "/placeholder.svg?height=300&width=300",
    category: "speakers",
    isOnSale: true,
    isBestSeller: false,
    inStock: 56,
  },
  {
    id: 7,
    name: "Noise-Cancelling Earbuds",
    description: "Advanced ANC technology in compact form",
    price: 249.99,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 987,
    image: "/placeholder.svg?height=300&width=300",
    category: "earbuds",
    isOnSale: false,
    isBestSeller: true,
    inStock: 19,
  },
  {
    id: 8,
    name: "Vintage Vinyl Player",
    description: "Classic turntable with modern connectivity",
    price: 599.99,
    originalPrice: 799.99,
    rating: 4.6,
    reviewCount: 234,
    image: "/placeholder.svg?height=300&width=300",
    category: "turntables",
    isOnSale: true,
    isBestSeller: false,
    inStock: 5,
  },
]

const categories = [
  { value: "all", label: "All Products" },
  { value: "headphones", label: "Headphones" },
  { value: "earbuds", label: "Earbuds" },
  { value: "speakers", label: "Speakers" },
  { value: "gaming", label: "Gaming" },
  { value: "turntables", label: "Turntables" },
]

const offers = [
  {
    id: 1,
    title: "Flash Sale",
    description: "Up to 50% off selected items",
    icon: Zap,
    color: "bg-red-500",
    endTime: "2024-01-31",
  },
  {
    id: 2,
    title: "Free Shipping",
    description: "On orders over $100",
    icon: Truck,
    color: "bg-green-500",
    endTime: null,
  },
  {
    id: 3,
    title: "Bundle Deals",
    description: "Buy 2 get 1 free on accessories",
    icon: Gift,
    color: "bg-blue-500",
    endTime: "2024-02-15",
  },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState("grid")
  const [wishlist, setWishlist] = useState(new Set())
  const [cartCount, setCartCount] = useState(0)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "newest":
        return b.id - a.id
      default:
        return 0
    }
  })

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist)
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId)
    } else {
      newWishlist.add(productId)
    }
    setWishlist(newWishlist)
  }

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`)
  }

  const addToCart = (productId) => {
    setCartCount(cartCount + 1)
    alert("Added to cart!")
  }

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
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlist.size > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{wishlist.size}</Badge>
                )}
              </Button>
              <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{cartCount}</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <OfferBanner />

      {/* Hero Section with Offers */}
      {/* <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Premium Audio Equipment</h2>
            <p className="text-xl opacity-90">Discover the perfect sound for every moment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer.id} className="bg-white/10 backdrop-blur border-white/20">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 ${offer.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <offer.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                  <p className="opacity-90">{offer.description}</p>
                  {offer.endTime && <p className="text-sm opacity-75 mt-2">Ends {offer.endTime}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          }`}
        >
          {sortedProducts.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-300 group ${
                viewMode === "list" ? "flex" : ""
              }`}
              onClick={() => handleProductClick(product.id)}
            >
              <div className={`relative ${viewMode === "list" ? "w-48" : "aspect-square"} overflow-hidden`}>
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isOnSale && (
                    <Badge variant="destructive" className="text-xs">
                      SALE
                    </Badge>
                  )}
                  {product.isBestSeller && <Badge className="bg-yellow-500 text-xs">BESTSELLER</Badge>}
                </div>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleWishlist(product.id)
                  }}
                >
                  <Heart className={`h-4 w-4 ${wishlist.has(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                </Button>

                {/* Stock Warning */}
                {product.inStock < 10 && (
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="bg-white/90 text-xs">
                      Only {product.inStock} left
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">${product.price}</span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className={`flex gap-2 pt-2 ${viewMode === "list" ? "flex-wrap" : ""}`}>
                    <Button
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleProductClick(product.id)
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product.id)
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Newsletter Signup */}
        <section className="mt-16 bg-muted rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-muted-foreground mb-6">
            Get the latest deals and new product announcements delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <Input placeholder="Enter your email" type="email" />
            <Button>Subscribe</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
