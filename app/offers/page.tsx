"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Zap, Gift, Percent, Star, Copy, Check, Timer, TrendingUp, ShoppingCart, Heart, Share2 } from 'lucide-react'

const flashSaleProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    originalPrice: 399.99,
    salePrice: 199.99,
    discount: 50,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviews: 2847,
    timeLeft: "2h 45m",
    sold: 156,
    total: 200,
    isLimitedStock: true,
  },
  {
    id: 2,
    name: "Gaming Headset RGB",
    originalPrice: 179.99,
    salePrice: 89.99,
    discount: 50,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.4,
    reviews: 1234,
    timeLeft: "1h 23m",
    sold: 89,
    total: 150,
    isLimitedStock: true,
  },
  {
    id: 3,
    name: "Bluetooth Speaker Pro",
    originalPrice: 249.99,
    salePrice: 149.99,
    discount: 40,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    reviews: 892,
    timeLeft: "3h 12m",
    sold: 67,
    total: 100,
    isLimitedStock: false,
  },
]

const coupons = [
  {
    id: 1,
    code: "SAVE20",
    title: "20% Off Everything",
    description: "Get 20% off on all products. Valid till midnight!",
    discount: "20%",
    minOrder: 100,
    maxDiscount: 50,
    validTill: "2024-02-01",
    category: "all",
    isPopular: true,
    usedCount: 1247,
    totalCount: 5000,
  },
  {
    id: 2,
    code: "FIRST50",
    title: "First Order Special",
    description: "Flat ₹50 off on your first order",
    discount: "₹50",
    minOrder: 199,
    maxDiscount: 50,
    validTill: "2024-02-15",
    category: "new-user",
    isPopular: false,
    usedCount: 234,
    totalCount: 1000,
  },
  {
    id: 3,
    code: "HEADPHONES30",
    title: "Headphones Special",
    description: "30% off on all headphones and earbuds",
    discount: "30%",
    minOrder: 150,
    maxDiscount: 100,
    validTill: "2024-01-31",
    category: "headphones",
    isPopular: true,
    usedCount: 567,
    totalCount: 2000,
  },
  {
    id: 4,
    code: "BUNDLE25",
    title: "Bundle Deal",
    description: "Buy 2 or more items and get 25% off",
    discount: "25%",
    minOrder: 200,
    maxDiscount: 75,
    validTill: "2024-02-10",
    category: "bundle",
    isPopular: false,
    usedCount: 89,
    totalCount: 500,
  },
]

const dailyDeals = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    originalPrice: 199.99,
    dealPrice: 99.99,
    discount: 50,
    image: "/placeholder.svg?height=150&width=150",
    timeLeft: "23h 45m",
    dealOfDay: true,
  },
  {
    id: 2,
    name: "Portable Speaker Mini",
    originalPrice: 79.99,
    dealPrice: 39.99,
    discount: 50,
    image: "/placeholder.svg?height=150&width=150",
    timeLeft: "15h 30m",
    dealOfDay: false,
  },
  {
    id: 3,
    name: "Audio Cable Premium",
    originalPrice: 29.99,
    dealPrice: 14.99,
    discount: 50,
    image: "/placeholder.svg?height=150&width=150",
    timeLeft: "8h 15m",
    dealOfDay: false,
  },
]

const bankOffers = [
  {
    id: 1,
    bank: "HDFC Bank",
    title: "10% Instant Discount",
    description: "Get 10% instant discount up to ₹1000 on HDFC Bank Credit Cards",
    maxDiscount: 1000,
    minOrder: 2000,
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    bank: "SBI Bank",
    title: "5% Cashback",
    description: "Get 5% cashback up to ₹500 on SBI Debit Cards",
    maxDiscount: 500,
    minOrder: 1000,
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    bank: "ICICI Bank",
    title: "No Cost EMI",
    description: "Convert your purchase into No Cost EMI with ICICI Bank Cards",
    maxDiscount: 0,
    minOrder: 5000,
    logo: "/placeholder.svg?height=40&width=40",
  },
]

export default function OffersPage() {
  const router = useRouter()
  const [copiedCoupon, setCopiedCoupon] = useState(null)

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    setTimeout(() => setCopiedCoupon(null), 2000)
  }

  const formatTimeLeft = (timeString) => {
    return timeString
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Offers & Deals</h1>
                <p className="text-white/90">Save big on your favorite products</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6" />
              <span className="font-bold">Flash Sale Live!</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="flash-sale" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="flash-sale" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Flash Sale
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="daily-deals" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily Deals
            </TabsTrigger>
            <TabsTrigger value="bank-offers" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Bank Offers
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Flash Sale Tab */}
          <TabsContent value="flash-sale" className="space-y-6">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">⚡ Flash Sale</h2>
                  <p className="text-white/90">Limited time offers - Grab them before they're gone!</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">02:45:30</div>
                  <div className="text-sm text-white/80">Time Left</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashSaleProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-square relative">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      {product.discount}% OFF
                    </Badge>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {product.isLimitedStock && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/90 p-2 rounded">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Sold: {product.sold}</span>
                            <span>Available: {product.total - product.sold}</span>
                          </div>
                          <Progress value={(product.sold / product.total) * 100} className="h-2" />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-red-500">${product.salePrice}</span>
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-red-500">
                        <Timer className="h-4 w-4" />
                        <span className="text-sm font-medium">{product.timeLeft} left</span>
                      </div>
                    </div>
                    <Button className="w-full bg-red-500 hover:bg-red-600">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">🎫 Exclusive Coupons</h2>
              <p className="text-white/90">Save more with our exclusive coupon codes</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden border-2 border-dashed hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 flex-shrink-0 flex flex-col items-center justify-center min-w-[120px]">
                        <Percent className="h-8 w-8 mb-2" />
                        <div className="text-2xl font-bold">{coupon.discount}</div>
                        <div className="text-xs">OFF</div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{coupon.title}</h3>
                            {coupon.isPopular && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>Min order: ${coupon.minOrder}</div>
                          <div>Max discount: ${coupon.maxDiscount}</div>
                          <div>Valid till: {coupon.validTill}</div>
                          <div className="flex items-center gap-2">
                            <Progress value={(coupon.usedCount / coupon.totalCount) * 100} className="h-1 flex-1" />
                            <span>{coupon.usedCount}/{coupon.totalCount} used</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="flex-1 bg-gray-100 p-2 rounded border-dashed border-2">
                            <code className="font-mono font-bold">{coupon.code}</code>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyCoupon(coupon.code)}
                            className="flex-shrink-0"
                          >
                            {copiedCoupon === coupon.code ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Daily Deals Tab */}
          <TabsContent value="daily-deals" className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">🌟 Daily Deals</h2>
              <p className="text-white/90">New deals every day - Don't miss out!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dailyDeals.map((deal) => (
                <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {deal.dealOfDay && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 text-center">
                      <span className="font-bold">⭐ Deal of the Day</span>
                    </div>
                  )}
                  <div className="aspect-square relative">
                    <Image
                      src={deal.image || "/placeholder.svg"}
                      alt={deal.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      {deal.discount}% OFF
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{deal.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-green-600">${deal.dealPrice}</span>
                      <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500 mb-3">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{deal.timeLeft} left</span>
                    </div>
                    <Button className="w-full">Add to Cart</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bank Offers Tab */}
          <TabsContent value="bank-offers" className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">🏦 Bank Offers</h2>
              <p className="text-white/90">Extra savings with your bank cards</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankOffers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden border">
                        <Image
                          src={offer.logo || "/placeholder.svg"}
                          alt={offer.bank}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{offer.bank}</CardTitle>
                        <p className="text-sm text-muted-foreground">{offer.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{offer.description}</p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      {offer.maxDiscount > 0 && <div>Max discount: ${offer.maxDiscount}</div>}
                      <div>Min order: ${offer.minOrder}</div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg">
              <h2 className="text-3xl font-bold mb-2">🔥 Trending Offers</h2>
              <p className="text-white/90">Most popular deals right now</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashSaleProducts.slice(0, 6).map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-pink-500">
                      Trending
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold">${product.salePrice}</span>
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                      <Badge variant="destructive" className="text-xs">
                        {product.discount}% OFF
                      </Badge>
                    </div>
                    <Button className="w-full">Shop Now</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
