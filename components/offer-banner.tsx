"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Zap, Gift, Percent, Clock } from 'lucide-react'

const bannerOffers = [
  {
    id: 1,
    title: "⚡ Flash Sale Live!",
    description: "Up to 70% off on electronics",
    bgColor: "bg-gradient-to-r from-red-500 to-orange-500",
    icon: Zap,
    timeLeft: "2h 45m",
    ctaText: "Shop Now",
    ctaLink: "/offers?tab=flash-sale",
  },
  {
    id: 2,
    title: "🎁 Free Shipping Weekend",
    description: "Free shipping on all orders above $50",
    bgColor: "bg-gradient-to-r from-green-500 to-blue-500",
    icon: Gift,
    timeLeft: "2 days",
    ctaText: "Explore",
    ctaLink: "/offers?tab=daily-deals",
  },
  {
    id: 3,
    title: "💳 Bank Offer",
    description: "Extra 10% off with HDFC cards",
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
    icon: Percent,
    timeLeft: "5 days",
    ctaText: "Get Offer",
    ctaLink: "/offers?tab=bank-offers",
  },
]

export function OfferBanner() {
  const [currentOffer, setCurrentOffer] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % bannerOffers.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!isVisible) return null

  const offer = bannerOffers[currentOffer]

  return (
    <Card className={`${offer.bgColor} text-white border-0 relative overflow-hidden`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-full">
              <offer.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{offer.title}</h3>
              <p className="text-white/90">{offer.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-white/90">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{offer.timeLeft} left</span>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              {offer.ctaText}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {bannerOffers.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentOffer ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
