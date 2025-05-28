"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Download,
  MessageCircle,
  Star,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

const mockOrderDetails = {
  "ORD-1234567890": {
    id: "ORD-1234567890",
    date: "2024-01-20",
    status: "Delivered",
    trackingNumber: "TRK12345678",
    estimatedDelivery: "2024-01-23",
    actualDelivery: "2024-01-22",
    carrier: "FedEx",
    items: [
      {
        id: 1,
        name: "Premium Wireless Headphones",
        price: 299.99,
        quantity: 1,
        image: "/placeholder.svg?height=100&width=100",
        color: "Midnight Black",
        size: "Standard",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
    },
    paymentMethod: {
      type: "Visa",
      last4: "4242",
    },
    subtotal: 299.99,
    shipping: 0,
    tax: 24.0,
    total: 323.99,
    timeline: [
      {
        status: "Order Placed",
        date: "2024-01-20 10:30 AM",
        completed: true,
        description: "Your order has been confirmed",
      },
      {
        status: "Processing",
        date: "2024-01-20 2:15 PM",
        completed: true,
        description: "Order is being prepared for shipment",
      },
      {
        status: "Shipped",
        date: "2024-01-21 9:00 AM",
        completed: true,
        description: "Package has been shipped via FedEx",
      },
      {
        status: "Out for Delivery",
        date: "2024-01-22 8:30 AM",
        completed: true,
        description: "Package is out for delivery",
      },
      {
        status: "Delivered",
        date: "2024-01-22 2:45 PM",
        completed: true,
        description: "Package delivered to front door",
      },
    ],
  },
}

export default function OrderTrackingPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const orderData = mockOrderDetails[orderId]
    if (orderData) {
      setOrder(orderData)
    }
  }, [orderId])

  const refreshTracking = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const downloadInvoice = () => {
    alert(`Downloading invoice for order ${orderId}`)
  }

  const getStatusIcon = (status, completed) => {
    if (completed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    switch (status) {
      case "Processing":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "Shipped":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "Delivered":
        return <Package className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getProgressValue = () => {
    if (!order) return 0
    const completedSteps = order.timeline.filter((step) => step.completed).length
    return (completedSteps / order.timeline.length) * 100
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    )
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
            <div>
              <h1 className="text-2xl font-bold">Order Tracking</h1>
              <p className="text-muted-foreground">{order.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={refreshTracking} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={downloadInvoice}>
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tracking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Status
                  </CardTitle>
                  <Badge
                    className={
                      order.status === "Delivered"
                        ? "bg-green-500"
                        : order.status === "Shipped"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(getProgressValue())}% Complete</span>
                  </div>
                  <Progress value={getProgressValue()} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Tracking Number</p>
                    <p className="font-medium font-mono">{order.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carrier</p>
                    <p className="font-medium">{order.carrier}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {order.status === "Delivered" ? "Delivered On" : "Estimated Delivery"}
                    </p>
                    <p className="font-medium">
                      {order.status === "Delivered"
                        ? new Date(order.actualDelivery).toLocaleDateString()
                        : new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.timeline.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(step.status, step.completed)}
                        {index < order.timeline.length - 1 && (
                          <div className={`w-0.5 h-12 mt-2 ${step.completed ? "bg-green-500" : "bg-muted"}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.status}
                          </h4>
                          <span className="text-sm text-muted-foreground">{step.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {item.color && <span>Color: {item.color}</span>}
                          {item.size && <span> • Size: {item.size}</span>}
                          <span> • Qty: {item.quantity}</span>
                        </div>
                        <p className="font-bold mt-1">${item.price}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="outline" size="sm">
                          Buy Again
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : `$${order.shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${order.tax}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">
                    {order.paymentMethod.type} ending in {order.paymentMethod.last4}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Return Item
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
