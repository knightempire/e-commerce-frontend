"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageZoom } from "@/components/image-zoom"
import { useCartStore } from "@/lib/cart-store"
import { ShareModal } from "@/components/share-modal"
import { Info } from "lucide-react"
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  AlertCircle,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  Package,
  Clock,
} from "lucide-react"
import { productAPI, type Product } from "@/lib/api"

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartCount } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [imageLoading, setImageLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
const [showAlert, setShowAlert] = useState(false)
const [alertMessage, setAlertMessage] = useState("")

  const isWishlistItem = product ? isInWishlist(product.product_id) : false

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const productData = await productAPI.getProductDetails(productId)
        if (productData) {
          setProduct(productData)
        } else {
          setError("Product not found")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleBuyNow = () => {
    // Always use our checkout page instead of external links
    const orderData = {
      product,
      selectedVariants: { color: "default", size: "standard" },
      quantity,
      subtotal: product?.extracted_price * quantity || 0,
    }
    localStorage.setItem("orderData", JSON.stringify(orderData))
    router.push("/checkout")
  }

  // Function to show the alert
const showCustomAlert = (message: string) => {
  setAlertMessage(message)
  setShowAlert(true)

  // Hide the alert after 3 seconds
  setTimeout(() => {
    setShowAlert(false)
  }, 3000)
}


  const handleAddToCart = async  () => {
    if (product) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      addToCart(product, quantity)
  showCustomAlert("Added to cart!") 
    }
  }

  const handleWishlistToggle = () => {
    if (product) {
      if (isWishlistItem) {
        removeFromWishlist(product.product_id)
      } else {
        addToWishlist(product)
      }
    }
  }

  const formatPrice = (price: string) => {
    const match = price.match(/[\d,]+\.?\d*/g)
    if (match) {
      return `$${match[0]}`
    }
    return price
  }

  const currentUrl = mounted ? window.location.href : ""

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-lg font-semibold">Loading Product...</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg border bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Loading image...</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <Skeleton className="h-10 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Product Not Found</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "The product you're looking for could not be found."}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
   <Button
  variant="ghost"
  size="icon"
  onClick={() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }}
>
  <ArrowLeft className="h-5 w-5" />
</Button>

            <h1 className="text-2xl font-bold">Product Details</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleWishlistToggle}>
              <Heart className={`h-5 w-5 ${isWishlistItem ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{getCartCount()}</Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

 {showAlert && (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="bg-green-500 text-white">
          <Info className="h-4 w-4" />
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      </div>
    )}


      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <div className="aspect-square relative overflow-hidden rounded-lg border bg-white">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="text-center">
                    <Clock className="h-8 w-8 animate-pulse text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading image...</p>
                  </div>
                </div>
              )}
              <Image
                src={images[selectedImageIndex] || "/placeholder.svg?height=600&width=600"}
                alt={product.title}
                fill
                className="object-cover"
                onLoad={() => setImageLoading(false)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=600"
                  setImageLoading(false)
                }}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {!imageLoading && (
                <ImageZoom
                  src={images[selectedImageIndex] || "/placeholder.svg?height=600&width=600"}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full"
                  zoomScale={2.5}
                />
              )}

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white shadow-md z-20"
                onClick={handleWishlistToggle}
              >
                <Heart className={`h-5 w-5 ${isWishlistItem ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 relative rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg?height=80&width=80"}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=80&width=80"
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              {/* Brand and Rating */}
              <div className="flex items-center gap-4 mb-4">
                {product.brand && (
                  <Badge variant="outline" className="text-sm font-medium">
                    {product.brand}
                  </Badge>
                )}
                {product.rating > 0 && (
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
                    <span className="text-sm text-muted-foreground font-medium">
                      {product.rating} ({product.reviews?.toLocaleString()} reviews)
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-4 leading-tight">{product.title}</h1>

              {product.description && (
                <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
              <Badge variant="secondary" className="text-sm">
                {product.source}
              </Badge>
            </div>

            {/* Delivery and Services */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="font-medium">{product.delivery}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Secure payment & buyer protection</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => setQuantity(quantity + 1)}>
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleBuyNow} className="w-full" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Now - ${(product.extracted_price * quantity).toFixed(2)}
              </Button>
              <Button onClick={handleAddToCart} variant="outline" className="w-full" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              {mounted && (
                <ShareModal
                  url={currentUrl}
                  title={product.title}
                  description={product.description}
                  price={formatPrice(product.price)}
                  image={product.thumbnail}
                >
                  <Button variant="ghost" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Product
                  </Button>
                </ShareModal>
              )}
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <span className="text-muted-foreground font-medium">{key}:</span>
                        <span className="font-medium text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
