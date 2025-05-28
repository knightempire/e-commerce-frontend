"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Minus, Plus, Trash2, Heart, ShoppingCart, Truck, Shield, Tag, Gift, Clock, AlertCircle, Percent } from 'lucide-react'

const mockCartItems = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=150&width=150",
    quantity: 1,
    color: "Midnight Black",
    size: "Standard",
    inStock: 47,
    isOnSale: true,
    estimatedDelivery: "2-3 days",
  },
  {
    id: 2,
    name: "Wireless Earbuds Pro",
    price: 199.99,
    originalPrice: 249.99,
    image: "/placeholder.svg?height=150&width=150",
    quantity: 2,
    color: "Pearl White",
    size: null,
    inStock: 23,
    isOnSale: true,
    estimatedDelivery: "2-3 days",
  },
  {
    id: 3,
    name: "Premium Bluetooth Speaker",
    price: 149.99,
    originalPrice: null,
    image: "/placeholder.svg?height=150&width=150",
    quantity: 1,
    color: "Space Gray",
    size: null,
    inStock: 5,
    isOnSale: false,
    estimatedDelivery: "5-7 days",
  },
]

const mockSavedItems = [
  {
    id: 4,
    name: "Gaming Headset RGB",
    price: 129.99,
    originalPrice: 179.99,
    image: "/placeholder.svg?height=150&width=150",
    inStock: true,
  },
  {
    id: 5,
    name: "Portable Mini Speaker",
    price: 49.99,
    originalPrice: 69.99,
    image: "/placeholder.svg?height=150&width=150",
    inStock: false,
  },
]

const mockRecommendations = [
  {
    id: 6,
    name: "Audio Cable Premium",
    price: 29.99,
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.5,
  },
  {
    id: 7,
    name: "Headphone Stand",
    price: 39.99,
    image: "/placeholder.svg?height=100&width=100",
    rating: 4.3,
  },
]

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [savedItems, setSavedItems] = useState(mockSavedItems)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [giftWrap, setGiftWrap] = useState(false)
  const [expressShipping, setExpressShipping] = useState(false)

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const moveToSaved = (id) => {
    const item = cartItems.find((item) => item.id === id)
    if (item) {
      setSavedItems([...savedItems, { ...item, quantity: undefined }])
      removeItem(id)
    }
  }

  const moveToCart = (id) => {
    const item = savedItems.find((item) => item.id === id)
    if (item) {
      setCartItems([...cartItems, { ...item, quantity: 1 }])
      setSavedItems(savedItems.filter((item) => item.id !== id))
    }
  }

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoApplied(true)
      alert("Promo code applied! 10% discount added.")
    } else if (promoCode.toUpperCase() === "SAVE20") {
      setPromoApplied(true)
      alert("Promo code applied! 20% discount added.");
    } else if (promoCode.toUpperCase() === "FIRST50") {
      setPromoApplied(true)
      alert("Promo code applied! $50 discount added.");
    } else {
      alert("Invalid promo code")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = cartItems.reduce(
    (sum, item) => sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0),
    0,
  )
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
            <Badge variant="secondary">{cartItems.length} items</Badge>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some items to get started</p>
            <Button onClick={() => router.push("/")}>Start Shopping</Button>
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
                    <div key={item.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                      <div className="flex gap-4">
                        <div className="w-32 h-32 relative rounded-lg overflow-hidden border">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                          {item.isOnSale && (
                            <Badge variant="destructive" className="absolute top-2 left-2 text-xs">
                              SALE
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {item.color && <span>Color: {item.color}</span>}
                              {item.size && <span>Size: {item.size}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">${item.price}</span>
                              {item.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                            </div>
                            {item.inStock < 10 && (
                              <div className="flex items-center gap-1 text-orange-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm">Only {item.inStock} left</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4" />
                            <span>Estimated delivery: {item.estimatedDelivery}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-16 text-center"
                                min="1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => moveToSaved(item.id)}>
                                <Heart className="h-4 w-4 mr-1" />
                                Save for later
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
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

              {/* Saved for Later */}
              {savedItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved for Later ({savedItems.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex gap-3">
                            <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-lg font-bold">${item.price}</p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => moveToCart(item.id)} disabled={!item.inStock}>
                                  Move to Cart
                                </Button>
                                <Button variant="outline" size="sm">
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

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Bought Together</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockRecommendations.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-lg font-bold">${item.price}</p>
                            <Button size="sm" className="mt-2">
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                        <Button size="sm" variant="outline" onClick={() => {
                          setPromoCode("SAVE20")
                          applyPromoCode()
                        }}>
                          Apply
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
                        <Button size="sm" variant="outline" onClick={() => {
                          setPromoCode("FIRST50")
                          applyPromoCode()
                        }}>
                          Apply
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
                          disabled={promoApplied}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={applyPromoCode} disabled={promoApplied || !promoCode}>
                          {promoApplied ? "Applied" : "Apply"}
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
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>You saved</span>
                        <span>-${savings.toFixed(2)}</span>
                      </div>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Promo discount</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    {giftWrap && (
                      <div className="flex justify-between">
                        <span>Gift wrap</span>
                        <span>${giftWrapFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
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
