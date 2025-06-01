"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CreditCard, Truck, Shield, Tag } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [transactionError, setTransactionError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    saveInfo: false,
    newsletter: false,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Check for cart order data first, then single product order data
    const cartOrderData = localStorage.getItem("cartOrderData")
    const singleOrderData = localStorage.getItem("orderData")

    if (cartOrderData) {
      const data = JSON.parse(cartOrderData)
      // Convert cart data to checkout format
      setOrderData({
        product: data.items[0], // For display purposes, show first item
        items: data.items,
        selectedVariants: data.items[0]?.selectedVariants || { color: "black", size: "standard" },
        quantity: data.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: data.subtotal,
        isCartOrder: true,
      })
    } else if (singleOrderData) {
      setOrderData(JSON.parse(singleOrderData))
    } else {
      router.push("/")
    }
  }, [router])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be at least 10 digits"
    }
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required"

    if (paymentMethod === "card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (transactionError) {
      setTransactionError("")
    }
  }

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === "SAVE10") {
      setPromoApplied(true)
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);
  setTransactionError("");

  try {
    // Extract digits from card number for your check
    const cardNumberDigits = formData.cardNumber.replace(/\D/g, "");

    // Card check logic
    let transactionResult = "error"; // default
    if (cardNumberDigits === "1") {
      transactionResult = "approved";
    } else if (cardNumberDigits === "2") {
      transactionResult = "declined";
    } else if (cardNumberDigits === "3") {
      transactionResult = "error";
    } else {
      transactionResult = "approved";
    }

    if (transactionResult === "approved") {
      // Build the payload for API
      const payload = {
        contact: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          newsletter: formData.newsletter,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        payment: {
          method: paymentMethod,
          ...(paymentMethod === "card"
            ? {
                cardNumber: formData.cardNumber,
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
                saveInfo: formData.saveInfo,
              }
            : {}),
        },
        order: {
          isCartOrder: orderData.isCartOrder,
          items: orderData.isCartOrder
            ? orderData.items
            : [
                {
                  ...orderData.product,
                  quantity: orderData.quantity,
                  selectedVariants: orderData.selectedVariants,
                },
              ],
          promoCode,
          subtotal,
          discount,
          shipping,
          tax,
          total,
        },
      };

      // Get auth token
      const stored = localStorage.getItem("shopwave");
      let token = "";
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed.token;
      }
      if (!token) {
        throw new Error("No auth token found");
      }

      // Call your API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/createorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create order");

      // Build final order data to store locally
      // Map payload.contact -> customerInfo, payload.shippingAddress -> customerInfo address fields
      const finalOrderData = {
        orderNumber: data.order?.orderNumber || `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        paymentMethod: payload.payment.method,
        promoApplied: promoCode ? true : false,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        isCartOrder: payload.order.isCartOrder,
        items: payload.order.items,
        product: !payload.order.isCartOrder ? payload.order.items[0] : undefined,
        quantity: !payload.order.isCartOrder ? payload.order.items[0]?.quantity : undefined,
        selectedVariants: !payload.order.isCartOrder ? payload.order.items[0]?.selectedVariants : undefined,
        customerInfo: {
          fullName: payload.contact.fullName,
          email: payload.contact.email,
          phone: payload.contact.phone,
          address: payload.shippingAddress.address,
          city: payload.shippingAddress.city,
          state: payload.shippingAddress.state,
          zipCode: payload.shippingAddress.zipCode,
        },
      };

      // Save to localStorage
      localStorage.setItem("finalOrder", JSON.stringify(finalOrderData));

      // Redirect to thank-you page
      router.push("/thank-you");
    } else if (transactionResult === "declined") {
      setTransactionError(
        "Transaction declined. Please check your payment information and try again."
      );
    } else {
      setTransactionError("Payment gateway errors. Please try again later.");
    }
  } catch (err: any) {
    setTransactionError(err.message);
  } finally {
    setIsLoading(false);
  }
};


  if (!orderData) {
    return <div>Loading...</div>
  }

  const subtotal = orderData.subtotal
  const shipping = subtotal > 100 ? 0 : 9.99
  const discount = promoApplied ? subtotal * 0.1 : 0
  const tax = (subtotal - discount + shipping) * 0.08
  const total = subtotal - discount + shipping + tax

  // Helper function to safely get price
  const getProductPrice = (product) => {
    if (typeof product.extracted_price === "number") {
      return product.extracted_price
    }
    if (typeof product.price === "string") {
      const match = product.price.match(/[\d,]+\.?\d*/g)
      if (match) {
        return Number.parseFloat(match[0].replace(/,/g, ""))
      }
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={errors.fullName ? "border-red-500" : ""}
                      />
                      {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => handleInputChange("newsletter", checked)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for exclusive offers
                    </Label>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className={errors.zipCode ? "border-red-500" : ""}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal">PayPal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="apple" id="apple" />
                      <Label htmlFor="apple">Apple Pay</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ")
                            handleInputChange("cardNumber", value)
                          }}
                          maxLength={19}
                          className={errors.cardNumber ? "border-red-500" : ""}
                        />
                        {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={formData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "")
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + "/" + value.substring(2, 4)
                              }
                              handleInputChange("expiryDate", value)
                            }}
                            maxLength={5}
                            className={errors.expiryDate ? "border-red-500" : ""}
                          />
                          {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                            maxLength={3}
                            className={errors.cvv ? "border-red-500" : ""}
                          />
                          {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveInfo"
                          checked={formData.saveInfo}
                          onCheckedChange={(checked) => handleInputChange("saveInfo", checked)}
                        />
                        <Label htmlFor="saveInfo" className="text-sm">
                          Save payment information for future purchases
                        </Label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Processing..." : `Complete Order - $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.isCartOrder ? (
                  <div className="space-y-4">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                          <Image
                            src={item.thumbnail || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedVariants?.color && `Color: ${item.selectedVariants.color}`}
                            {item.selectedVariants?.size && ` | Size: ${item.selectedVariants.size}`}
                          </p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-semibold">${getProductPrice(item).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div className="w-20 h-20 relative rounded-lg overflow-hidden border">
                      <Image
                        src={orderData.product.thumbnail || "/placeholder.svg"}
                        alt={orderData.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{orderData.product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Color: {orderData.selectedVariants.color} | Size: {orderData.selectedVariants.size}
                      </p>
                      <p className="text-sm text-muted-foreground">Qty: {orderData.quantity}</p>
                      <p className="font-semibold">${getProductPrice(orderData.product).toFixed(2)}</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label>Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={promoApplied || !promoCode}
                    >
                      {promoApplied ? "Applied" : "Apply"}
                    </Button>
                  </div>
                  {promoApplied && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Tag className="h-4 w-4" />
                      <span className="text-sm">SAVE10 applied - 10% off!</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
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

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span className="text-sm font-medium">Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Secure checkout with SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Transaction error message in bottom right */}
      {transactionError && (
        <div
          className="fixed bottom-4 right-4 max-w-md p-4 border border-red-400 rounded-lg bg-gradient-to-b from-red-100 to-red-50 flex items-start space-x-3 shadow-md z-50"
          role="alert"
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center bg-white border border-red-300 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-red-500"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Error</h3>
            <p className="text-gray-700 text-sm">{transactionError}</p>
          </div>
        </div>
      )}
    </div>
  )
}

