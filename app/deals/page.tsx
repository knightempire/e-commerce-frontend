"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, Zap, Star, ShoppingCart, Heart, Timer } from 'lucide-react'

const lightningDeals = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    originalPrice: 399.99,
    dealPrice: 199.99,
    discount: 50,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.8,
    reviews: 2847,
    timeLeft: "01:23:45",
    claimed: 67,
    total: 100,
    status: "live",
  },
  {
    id: 2,
    name: "Gaming Headset RGB",
    originalPrice: 179.99,
    dealPrice: 89.99,
    discount: 50,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.4,
    reviews: 1234,
    timeLeft: "02:15:30",
    claimed: 45,
    total: 80,
    status: "live",
  },
  {
    id: 3,
    name: "Bluetooth Speaker Pro",
    originalPrice: 249.99,
    dealPrice: 149.99,
    discount: 40,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.6,
    reviews: 892,
    timeLeft: "00:45:12",
    claimed: 89,
    total: 100,
    status: "ending-soon",
  },
  {
    id: 4,
    name: "Wireless Earbuds Pro",
    originalPrice: 199.99,
    dealPrice: 99.99,
    discount: 50,
    image: "/placeholder.svg?height=200&width=200",
    rating: 4.5,
    reviews: 1567,
    timeLeft: "Upcoming",
    claimed: 0,
    total: 150,
    status: "upcoming",
  },
]

export default function DealsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState("all")

  const filteredDeals = lightningDeals.filter((deal) => {
    if (filter === "all") return true
    return deal.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "live":
        return "bg-green-500"
      case "ending-soon":
        return "bg-red-500"
      case "upcoming":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "live":
        return "Live Now"
      case "ending-soon":
        return "Ending Soon"
      case "upcoming":
        return "Coming Soon"
      default:
        return "Deal"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  Lightning Deals
                </h1>
                <p className="text-white/90">Limited time offers with limited quantities</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">⚡ LIVE</div>
              <div className="text-sm text-white/80">New deals every hour</div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { key: "all", label: "All Deals", count: lightningDeals.length },
            { key: "live", label: "Live Now", count: lightningDeals.filter(d => d.status === "live").length },
            { key: "ending-soon", label: "Ending Soon", count: lightningDeals.filter(d => d.status === "ending-soon").length },
            { key: "upcoming", label: "Upcoming", count: lightningDeals.filter(d => d.status === "upcoming").length },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "outline"}
              onClick={() => setFilter(tab.key)}
              className="flex-shrink-0"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                <div className="aspect-square relative">
                  <Image
                    src={deal.image || "/placeholder.svg"}
                    alt={deal.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Status Badge */}
                <Badge className={`absolute top-2 left-2 ${getStatusColor(deal.status)} text-white`}>
                  {getStatusText(deal.status)}
                </Badge>

                {/* Discount Badge */}
                <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                  {deal.discount}% OFF
                </Badge>

                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute bottom-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="h-4 w-4" />
                </Button>

                {/* Progress Bar for Live Deals */}
                {deal.status === "live" && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-600 font-medium">{deal.claimed}% claimed</span>
                      <span className="text-muted-foreground">{deal.total - deal.claimed} left</span>
                    </div>
                    <Progress value={(deal.claimed / deal.total) * 100} className="h-1" />
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{deal.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(deal.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({deal.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-red-600">${deal.dealPrice}</span>
                  <span className="text-sm text-muted-foreground line-through">${deal.originalPrice}</span>
                </div>

                {/* Timer */}
                {deal.status !== "upcoming" && (
                  <div className="flex items-center gap-1 text-red-500 mb-3">
                    <Timer className="h-4 w-4" />
                    <span className="text-sm font-medium">{deal.timeLeft}</span>
                  </div>
                )}

                {/* Action Button */}
                {deal.status === "upcoming" ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    Notify Me
                  </Button>
                ) : deal.claimed >= deal.total ? (
                  <Button variant="outline" className="w-full" disabled>
                    Sold Out
                  </Button>
                ) : (
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-16">
            <Zap className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No deals found</h2>
            <p className="text-muted-foreground mb-6">Check back later for new lightning deals</p>
            <Button onClick={() => setFilter("all")}>View All Deals</Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-muted rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-4 text-center">How Lightning Deals Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Limited Time</h4>
              <p className="text-sm text-muted-foreground">Deals are available for a limited time only</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Limited Quantity</h4>
              <p className="text-sm text-muted-foreground">Only a limited number of items available</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">First Come, First Served</h4>
              <p className="text-sm text-muted-foreground">Deals are claimed on a first-come, first-served basis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
