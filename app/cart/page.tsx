"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCartStore } from "@/lib/cart-store"
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  Tag,
  Gift,
  Clock,
  Percent,
  Loader2,
} from "lucide-react"
import { useState } from "react"

export default function CartPage() {
  const router = useRouter()
  const {
    cartItems,
    wishlistItems,
    updateQuantity,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    getCartTotal,
    getCartCount,
  } = useCartStore()

  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [giftWrap, setGiftWrap] = useState(false)
  const [expressShipping, setExpressShipping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const moveToSaved = (productId: string) => {
    const item = cartItems.find((item) => item.product_id === productId)
    if (item) {
      addToWishlist(item)
      removeFromCart(productId)
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const applyPromoCode = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      if (promoCode.toUpperCase() === "SAVE10") {
        setPromoApplied(true)
        alert("Promo code applied! 10% discount added.")
      } else if (promoCode.toUpperCase() === "SAVE20") {
        setPromoApplied(true)
        alert("Promo code applied! 20% discount added.")
      } else if (promoCode.toUpperCase() === "FIRST50") {
        setPromoApplied(true)
        alert("Promo code applied! $50 discount added.")
      } else {
        alert("Invalid promo code")
      }
      setIsLoading(false)
    }, 1000)
  }

  const subtotal = getCartTotal()
  const savings = cartItems.reduce((sum, item) => {
    // Calculate savings if there was an original price (for demo, assume 20% savings)
    return sum + item.extracted_price * item.quantity * 0.1
  }, 0)
  const discount = promoApplied ? subtotal * 0.1 : 0
  const giftWrapFee = giftWrap ? 4.99 : 0
  const shippingFee = expressShipping ? 9.99 : subtotal > 100 ? 0 : 5.99
  const tax = (subtotal - discount + giftWrapFee + shippingFee) * 0.08
  const total = subtotal - discount + giftWrapFee + shippingFee + tax

  const handleCheckout = () => {
    const orderData = {
      items: cartItems,
      subtotal,
      discount,
      giftWrap,
      expressShipping,
      total,
    }
    localStorage.setItem("cartOrderData", JSON.stringify(orderData))
    router.push("/checkout")
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
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
            <Badge variant="secondary">{getCartCount()} items</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/saved")}>
              <Heart className="h-4 w-4 mr-2" />
              Saved ({wishlistItems.length})
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to get started</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/")}>Start Shopping</Button>
              {wishlistItems.length > 0 && (
                <Button variant="outline" onClick={() => router.push("/saved")}>
                  <Heart className="h-4 w-4 mr-2" />
                  View Saved Items ({wishlistItems.length})
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items List */}
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.product_id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex gap-4">
                        <div
                          className="w-32 h-32 relative rounded-lg overflow-hidden border cursor-pointer"
                          onClick={() => handleProductClick(item.product_id)}
                        >
                          <Image
                            src={item.thumbnail || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <h3
                              className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                              onClick={() => handleProductClick(item.product_id)}
                            >
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {item.selectedVariants?.color && <span>Color: {item.selectedVariants.color}</span>}
                              {item.selectedVariants?.size && <span>Size: {item.selectedVariants.size}</span>}
                              <Badge variant="outline">{item.source}</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">{formatPrice(item.extracted_price)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span>{item.delivery}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.product_id, Number.parseInt(e.target.value) || 1)}
                                className="w-16 text-center"
                                min="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => moveToSaved(item.product_id)}>
                                <Heart className="h-4 w-4 mr-1" />
                                Save for later
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.product_id)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Saved for Later Preview */}
              {wishlistItems.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Saved for Later ({wishlistItems.length})</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => router.push("/saved")}>
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wishlistItems.slice(0, 4).map((item) => (
                        <div key={item.product_id} className="border rounded-lg p-4">
                          <div className="flex gap-3">
                            <div
                              className="w-16 h-16 relative rounded-lg overflow-hidden cursor-pointer"
                              onClick={() => handleProductClick(item.product_id)}
                            >
                              <Image
                                src={item.thumbnail || "/placeholder.svg"}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4
                                className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
                                onClick={() => handleProductClick(item.product_id)}
                              >
                                {item.title}
                              </h4>
                              <p className="text-lg font-bold">{formatPrice(item.extracted_price)}</p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => moveToCart(item.product_id)}>
                                  Move to Cart
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => removeFromWishlist(item.product_id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Promo Code Section */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Available Offers</Label>

                    {/* Quick Apply Coupons */}
                    <div className="grid grid-cols-1 gap-2">
                      <div className="border rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded">
                            <Percent className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">SAVE20</p>
                            <p className="text-xs text-muted-foreground">20% off up to $50</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPromoCode("SAVE20")
                            applyPromoCode()
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>

                      <div className="border rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded">
                            <Gift className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">FIRST50</p>
                            <p className="text-xs text-muted-foreground">$50 off on first order</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPromoCode("FIRST50")
                            applyPromoCode()
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                      </div>
                    </div>

                    {/* Manual Promo Code Entry */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied || isLoading}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={applyPromoCode}
                          disabled={promoApplied || !promoCode || isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : promoApplied ? (
                            "Applied"
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                      {promoApplied && (
                        <div className="flex items-center gap-2 text-green-600 mt-2">
                          <Tag className="h-4 w-4" />
                          <span className="text-sm">Coupon applied successfully!</span>
                        </div>
                      )}
                    </div>

                    <Button variant="ghost" className="w-full text-blue-600" onClick={() => router.push("/offers")}>
                      View All Offers & Coupons
                    </Button>
                  </div>

                  <Separator />

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox id="giftWrap" checked={giftWrap} onCheckedChange={setGiftWrap} />
                        <Label htmlFor="giftWrap" className="flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          Gift wrap
                        </Label>
                      </div>
                      <span className="text-sm">+$4.99</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox id="expressShipping" checked={expressShipping} onCheckedChange={setExpressShipping} />
                        <Label htmlFor="expressShipping" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Express shipping
                        </Label>
                      </div>
                      <span className="text-sm">+$9.99</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({getCartCount()} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>You saved</span>
                        <span>-{formatPrice(savings)}</span>
                      </div>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    {giftWrap && (
                      <div className="flex justify-between">
                        <span>Gift wrap</span>
                        <span>{formatPrice(giftWrapFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>

                  {/* Security Info */}
                  <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Free shipping on orders over $100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
