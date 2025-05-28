"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  ArrowLeft,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Mock product data - in real app this would come from API
const products = {
  1: {
    id: 1,
    name: "Premium Wireless Headphones",
    description:
      "Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation, 30-hour battery life, and premium comfort padding.",
    price: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewCount: 2847,
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    variants: {
      color: [
        { name: "Midnight Black", value: "black", available: true },
        { name: "Pearl White", value: "white", available: true },
        { name: "Rose Gold", value: "rose", available: false },
      ],
      size: [
        { name: "Standard", value: "standard", available: true },
        { name: "Large", value: "large", available: true },
      ],
    },
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Quick charge: 5 min = 3 hours",
      "Premium comfort padding",
      "Bluetooth 5.0",
      "Voice assistant compatible",
    ],
    inStock: 47,
    category: "headphones",
    isOnSale: true,
    isBestSeller: true,
  },
  // Add other products here...
}

const relatedProducts = [
  { id: 2, name: "Wireless Earbuds Pro", price: 199.99, image: "/placeholder.svg?height=200&width=200", rating: 4.6 },
  { id: 3, name: "Premium Speaker", price: 149.99, image: "/placeholder.svg?height=200&width=200", rating: 4.7 },
  { id: 4, name: "Audio Cable", price: 29.99, image: "/placeholder.svg?height=200&width=200", rating: 4.3 },
  { id: 5, name: "Gaming Headset", price: 129.99, image: "/placeholder.svg?height=200&width=200", rating: 4.4 },
]

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    date: "2 days ago",
    comment: "Absolutely amazing sound quality! The noise cancellation works perfectly.",
    verified: true,
    helpful: 24,
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 4,
    date: "1 week ago",
    comment: "Great headphones, very comfortable for long listening sessions.",
    verified: true,
    helpful: 18,
  },
  {
    id: 3,
    name: "Emily Davis",
    rating: 5,
    date: "2 weeks ago",
    comment: "Best purchase I've made this year. Highly recommended!",
    verified: true,
    helpful: 32,
  },
]

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  useEffect(() => {
    const productData = products[productId]
    if (productData) {
      setProduct(productData)
      setSelectedColor(productData.variants.color[0]?.value || "")
      setSelectedSize(productData.variants.size[0]?.value || "")
    }
  }, [productId])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found</p>
      </div>
    )
  }

  const handleBuyNow = () => {
    const orderData = {
      product,
      selectedVariants: {
        color: selectedColor,
        size: selectedSize,
      },
      quantity,
      subtotal: product.price * quantity,
    }

    localStorage.setItem("orderData", JSON.stringify(orderData))
    router.push("/checkout")
  }

  const handleAddToCart = () => {
    alert("Added to cart!")
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
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
            <h1 className="text-2xl font-bold">AudioStore</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images with Zoom */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg border group">
              <Image
                src={product.images[currentImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Zoom Button */}
              <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="absolute top-4 left-4 bg-white/80 hover:bg-white">
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full h-[80vh]">
                  <div className="relative w-full h-full">
                    <Image
                      src={product.images[currentImage] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </Button>

              {/* Badges */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {product.isOnSale && (
                  <Badge variant="destructive">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
                {product.isBestSeller && <Badge className="bg-yellow-500">BESTSELLER</Badge>}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`aspect-square w-20 rounded-lg border-2 overflow-hidden flex-shrink-0 ${
                    currentImage === index ? "border-primary" : "border-muted"
                  }`}
                >
                  <Image src={image || "/placeholder.svg"} alt="" width={80} height={80} className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
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
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground mt-2">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">${product.originalPrice}</span>
                  <Badge variant="destructive">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Color</Label>
              <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
                <div className="flex gap-3">
                  {product.variants.color.map((color) => (
                    <div key={color.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={color.value} id={color.value} disabled={!color.available} />
                      <Label
                        htmlFor={color.value}
                        className={`cursor-pointer ${!color.available ? "text-muted-foreground" : ""}`}
                      >
                        {color.name}
                        {!color.available && " (Out of Stock)"}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Size</Label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.size.map((size) => (
                    <SelectItem key={size.value} value={size.value} disabled={!size.available}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Quantity</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min="1"
                />
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{product.inStock} in stock</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleBuyNow} className="w-full" size="lg">
                Buy Now - ${(product.price * quantity).toFixed(2)}
              </Button>
              <Button onClick={handleAddToCart} variant="outline" className="w-full" size="lg">
                Add to Cart
              </Button>
              <Button variant="ghost" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">Free Shipping</div>
                  <div className="text-muted-foreground">2-3 days</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">2 Year Warranty</div>
                  <div className="text-muted-foreground">Full coverage</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm">
                  <div className="font-medium">30-Day Returns</div>
                  <div className="text-muted-foreground">Free returns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">{product.rating}</div>
                        <div className="flex items-center justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">Based on {product.reviewCount} reviews</p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-2">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${Math.random() * 80 + 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-12">
                              {Math.floor(Math.random() * 500)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback>
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{review.name}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground mb-3">{review.comment}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm">
                              👍 Helpful ({review.helpful})
                            </Button>
                            <Button variant="ghost" size="sm">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-4">Audio</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Driver:</span>
                          <span>40mm dynamic</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Frequency Response:</span>
                          <span>20Hz - 20kHz</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Impedance:</span>
                          <span>32 ohms</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Sensitivity:</span>
                          <span>110dB</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4">Connectivity</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Bluetooth:</span>
                          <span>5.0</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Range:</span>
                          <span>10 meters</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Codecs:</span>
                          <span>SBC, AAC, aptX</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">3.5mm jack:</span>
                          <span>Included</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Shipping Options</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span>Standard Shipping:</span>
                          <span>5-7 business days (Free)</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Express Shipping:</span>
                          <span>2-3 business days ($9.99)</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Overnight Shipping:</span>
                          <span>1 business day ($19.99)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Return Policy</h4>
                      <p className="text-sm text-muted-foreground">
                        30-day return policy. Items must be in original condition with all accessories included. Free
                        return shipping for defective items.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/product/${relatedProduct.id}`)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(relatedProduct.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{relatedProduct.rating}</span>
                  </div>
                  <p className="text-lg font-bold">${relatedProduct.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
