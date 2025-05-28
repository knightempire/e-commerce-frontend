"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Edit,
  Plus,
  Trash2,
  Download,
  Eye,
  ArrowLeft,
  Settings,
  Heart,
} from "lucide-react"

const mockUser = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "/placeholder.svg?height=100&width=100",
  joinDate: "2023-01-15",
  totalOrders: 24,
  totalSpent: 2847.99,
  loyaltyPoints: 1250,
}

const mockAddresses = [
  {
    id: 1,
    type: "Home",
    name: "John Doe",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    isDefault: true,
  },
  {
    id: 2,
    type: "Work",
    name: "John Doe",
    address: "456 Business Ave",
    city: "New York",
    state: "NY",
    zipCode: "10002",
    isDefault: false,
  },
]

const mockPaymentMethods = [
  {
    id: 1,
    type: "Visa",
    last4: "4242",
    expiryMonth: "12",
    expiryYear: "25",
    isDefault: true,
  },
  {
    id: 2,
    type: "Mastercard",
    last4: "8888",
    expiryMonth: "08",
    expiryYear: "26",
    isDefault: false,
  },
]

const mockOrders = [
  {
    id: "ORD-1234567890",
    date: "2024-01-20",
    status: "Delivered",
    total: 299.99,
    items: 1,
    trackingNumber: "TRK12345678",
  },
  {
    id: "ORD-1234567891",
    date: "2024-01-15",
    status: "Shipped",
    total: 149.99,
    items: 2,
    trackingNumber: "TRK12345679",
  },
  {
    id: "ORD-1234567892",
    date: "2024-01-10",
    status: "Processing",
    total: 199.99,
    items: 1,
    trackingNumber: null,
  },
]

const mockWishlist = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "/placeholder.svg?height=100&width=100",
    inStock: true,
  },
  {
    id: 2,
    name: "Gaming Headset RGB",
    price: 129.99,
    image: "/placeholder.svg?height=100&width=100",
    inStock: false,
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState(mockUser)
  const [addresses, setAddresses] = useState(mockAddresses)
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    sms: true,
  })

  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  })

  const handleSaveProfile = () => {
    setUser({ ...user, ...editForm })
    setIsEditing(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500"
      case "Shipped":
        return "bg-blue-500"
      case "Processing":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const downloadInvoice = (orderId) => {
    // Simulate invoice download
    alert(`Downloading invoice for order ${orderId}`)
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
            <h1 className="text-2xl font-bold">My Profile</h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      Member since {new Date(user.joinDate).getFullYear()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="font-bold text-lg">{user.totalOrders}</div>
                      <div className="text-sm text-muted-foreground">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{user.loyaltyPoints}</div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? "Cancel" : "Edit"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">Full Name</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-muted-foreground">Email Address</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{user.phone}</p>
                              <p className="text-sm text-muted-foreground">Phone Number</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">Account Statistics</p>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Orders:</span>
                                <span className="font-medium">{user.totalOrders}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total Spent:</span>
                                <span className="font-medium">${user.totalSpent}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Loyalty Points:</span>
                                <span className="font-medium">{user.loyaltyPoints}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockOrders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Ordered on {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p className="font-medium">${order.total}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Items</p>
                              <p className="font-medium">{order.items}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Tracking</p>
                              <p className="font-medium">{order.trackingNumber || "N/A"}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadInvoice(order.id)}>
                                <Download className="h-4 w-4 mr-1" />
                                Invoice
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Addresses Tab */}
              <TabsContent value="addresses" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Saved Addresses</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={address.isDefault ? "default" : "secondary"}>{address.type}</Badge>
                            {address.isDefault && <Badge variant="outline">Default</Badge>}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">{address.name}</p>
                            <p>{address.address}</p>
                            <p>
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Payment Methods</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium">
                                  {method.type} ending in {method.last4}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {method.isDefault && <Badge variant="outline">Default</Badge>}
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      My Wishlist ({mockWishlist.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockWishlist.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 relative rounded-lg overflow-hidden">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-lg font-bold">${item.price}</p>
                              <Badge variant={item.inStock ? "default" : "secondary"} className="mt-1">
                                {item.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" disabled={!item.inStock}>
                                  Add to Cart
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
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                      </div>
                      <Switch
                        checked={notifications.orderUpdates}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, orderUpdates: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Promotions & Deals</p>
                        <p className="text-sm text-muted-foreground">Receive special offers and discounts</p>
                      </div>
                      <Switch
                        checked={notifications.promotions}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Newsletter</p>
                        <p className="text-sm text-muted-foreground">Weekly newsletter with new products</p>
                      </div>
                      <Switch
                        checked={notifications.newsletter}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, newsletter: checked })}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive text messages for urgent updates</p>
                      </div>
                      <Switch
                        checked={notifications.sms}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download My Data
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
