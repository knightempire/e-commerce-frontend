"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Download, Mail, Package, Truck, MapPin, Calendar, CreditCard, Share2, Star } from "lucide-react"

export default function ThankYouPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState(null)
  const [trackingNumber, setTrackingNumber] = useState("")

  useEffect(() => {
    const savedOrderData = localStorage.getItem("finalOrder")
    if (savedOrderData) {
      const data = JSON.parse(savedOrderData)
      setOrderData(data)
      setTrackingNumber(`TRK${Date.now().toString().slice(-8)}`)
    } else {
      router.push("/")
    }
  }, [router])

  const handleDownloadReceipt = () => {
    // Simulate receipt download
    alert("Receipt downloaded!")
  }

  const handleTrackOrder = () => {
    // Simulate order tracking
    alert(`Tracking your order with number: ${trackingNumber}`)
  }

  const handleShareOrder = () => {
    // Simulate social sharing
    alert("Order shared!")
  }

  // Helper function to safely get price
  const getProductPrice = (product) => {
    if (typeof product?.extracted_price === "number") {
      return product.extracted_price
    }
    if (typeof product?.price === "string") {
      const match = product.price.match(/[\d,]+\.?\d*/g)
      if (match) {
        return Number.parseFloat(match[0].replace(/,/g, ""))
      }
    }
    return 0
  }

  if (!orderData) {
    return <div>Loading...</div>
  }

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

  const subtotal = orderData.subtotal
  const shipping = subtotal > 100 ? 0 : 9.99
  const discount = orderData.promoApplied ? subtotal * 0.1 : 0
  const tax = (subtotal - discount + shipping) * 0.08
  const total = subtotal - discount + shipping + tax

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">AudioStore</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge variant="secondary">Confirmed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4" />
                      <span className="font-medium">Order Number</span>
                    </div>
                    <p className="text-lg font-mono">{orderData.orderNumber}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Order Date</span>
                    </div>
                    <p>{new Date(orderData.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Tracking Number</span>
                    </div>
                    <p className="font-mono">{trackingNumber}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Payment Method</span>
                    </div>
                    <p className="capitalize">{orderData.paymentMethod}</p>
                  </div>
                </div>

                <Separator />

                {/* Product Details */}
                <div>
                  <h3 className="font-semibold mb-4">Items Ordered</h3>
                  {orderData.isCartOrder ? (
                    // Multiple items from cart
                    <div className="space-y-4">
                      {orderData.items.map((item, index) => (
                        <div key={index} className="flex gap-4 p-4 border rounded-lg">
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                            <Image
                              src={item.thumbnail || "/placeholder.svg"}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.selectedVariants?.color && `Color: ${item.selectedVariants.color}`}
                              {item.selectedVariants?.size && ` | Size: ${item.selectedVariants.size}`}
                            </p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                            <p className="font-semibold mt-2">${getProductPrice(item).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Single item
                    <div className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                        <Image
                          src={orderData.product.thumbnail || "/placeholder.svg"}
                          alt={orderData.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{orderData.product.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Color: {orderData.selectedVariants.color} | Size: {orderData.selectedVariants.size}
                        </p>
                        <p className="text-sm text-muted-foreground">Quantity: {orderData.quantity}</p>
                        <p className="font-semibold mt-2">${getProductPrice(orderData.product).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button onClick={handleDownloadReceipt} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button onClick={handleTrackOrder} variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                  <Button onClick={handleShareOrder} variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Name:</span> {orderData.customerInfo.fullName}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {orderData.customerInfo.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {orderData.customerInfo.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="space-y-1 text-sm">
                      <p>{orderData.customerInfo.fullName}</p>
                      <p>{orderData.customerInfo.address}</p>
                      <p>
                        {orderData.customerInfo.city}, {orderData.customerInfo.state} {orderData.customerInfo.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {estimatedDelivery.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Order confirmed</span>
                    <span className="text-xs text-muted-foreground ml-auto">Just now</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Processing</span>
                    <span className="text-xs text-muted-foreground ml-auto">Within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Shipped</span>
                    <span className="text-xs text-muted-foreground ml-auto">1-2 days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Delivered</span>
                    <span className="text-xs text-muted-foreground ml-auto">2-3 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {orderData.promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
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
              </CardContent>
            </Card>

            {/* Email Confirmation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to <strong>{orderData.customerInfo.email}</strong> with your order
                  details and tracking information.
                </p>
              </CardContent>
            </Card>

            {/* Review Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Leave a Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Help other customers by sharing your experience with this product.
                </p>
                <Button variant="outline" className="w-full">
                  Write a Review
                </Button>
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <Card>
              <CardContent className="pt-6">
                <Button onClick={() => router.push("/")} className="w-full">
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
