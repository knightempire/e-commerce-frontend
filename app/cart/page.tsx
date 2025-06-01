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
import { useState, useEffect } from "react"

type CartItem = {
  product_id: string
  title: string
  thumbnail: string
  extracted_price: number
  quantity: number
  delivery: string
  source: string
  selectedVariants?: {
    color?: string
    size?: string
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [wishlistItems, setWishlistItems] = useState<CartItem[]>([]) // You can manage wishlist similarly if you want
  const [isLoading, setIsLoading] = useState(true)

  // Promo, gift, shipping states
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [giftWrap, setGiftWrap] = useState(false)
  const [expressShipping, setExpressShipping] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)

  // Fetch cart from API on mount
  useEffect(() => {
    const fetchCart = async () => {
      const stored = localStorage.getItem("shopwave")
      let token = ""
      if (stored) {
        const parsed = JSON.parse(stored)
        token = parsed.token
      }
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/viewcart`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch cart")
        const data = await res.json()
        // Assuming your backend returns an array of cart items
        setCartItems(data.cartItems || [])
      } catch (error) {
        console.error("Error fetching cart:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCart()
  }, [])
const updateQuantity = async (productId: string, newQuantity: number) => {
  if (newQuantity < 1) return;

  // Find the product item in cartItems first
  const productItem = cartItems.find(item => item.product_id === productId);
  if (!productItem) return;

  // Update local state first
  setCartItems(items =>
    items.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    )
  );

  console.log("Updating quantity for product:", productId, "to", newQuantity);

  try {
    const stored = localStorage.getItem('shopwave');
    let token = '';
    if (stored) {
      const parsed = JSON.parse(stored);
      token = parsed.token;
    }
    if (!token) {
      console.error('No auth token found');
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/updatequantity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // send token in header
      },
      body: JSON.stringify({
        productId,
        quantity: newQuantity,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to update quantity on server');
    }

    const data = await res.json();
    // Optionally sync local state with server returned cartItems
    // setCartItems(data.cartItems);

  } catch (error) {
    console.error('Error updating quantity:', error);
    // Optionally revert UI changes or show error message
  }
};



const removeFromCart = async (productId: string) => {
  const stored = localStorage.getItem("shopwave");
  if (!stored) {
    alert("You must be logged in to remove items.");
    return;
  }
  const { token } = JSON.parse(stored);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/removecart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || "Failed to remove item from cart");
      return;
    }

    const data = await res.json();
    setCartItems(data.cartItems || []);
  } catch (error) {
    console.error("Error removing from cart:", error);
    alert("An error occurred while removing the item.");
  }
};

  // For demo, wishlist store logic can be added as needed
  const addToWishlist = (item: CartItem) => {
    setWishlistItems((prev) => [...prev, item])
  }
  const removeFromWishlist = (productId: string) => {
    setWishlistItems((items) => items.filter((item) => item.product_id !== productId))
  }
  const moveToCart = (productId: string) => {
    const item = wishlistItems.find((item) => item.product_id === productId)
    if (item) {
      setCartItems((prev) => [...prev, item])
      removeFromWishlist(productId)
    }
  }

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

  // Promo code apply
  const applyPromoCode = () => {
    setPromoLoading(true)
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
      setPromoLoading(false)
    }, 1000)
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.extracted_price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  // Pricing calculations
  const subtotal = getCartTotal()
  const savings = cartItems.reduce((sum, item) => sum + item.extracted_price * item.quantity * 0.1, 0) // Demo 10% savings
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

  if (isLoading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )

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
                                min={1}
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
                  <CardContent className="space-y-6">
                    {wishlistItems.slice(0, 3).map((item) => (
                      <div key={item.product_id} className="flex gap-4 items-center">
                        <div className="w-20 h-20 relative rounded-lg overflow-hidden border cursor-pointer" onClick={() => handleProductClick(item.product_id)}>
                          <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold cursor-pointer" onClick={() => handleProductClick(item.product_id)}>
                            {item.title}
                          </h3>
                          <Button size="sm" variant="outline" onClick={() => moveToCart(item.product_id)}>
                            Move to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary & Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>You saved</span>
                    <span>-{formatPrice(savings)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between mt-2 mb-2">
                    <span>Gift Wrap</span>
                    <span>{giftWrap ? formatPrice(giftWrapFee) : "-"}</span>
                  </div>
                  <Checkbox checked={giftWrap} onCheckedChange={(checked) => setGiftWrap(!!checked)} id="giftwrap" />
                  <Label htmlFor="giftwrap" className="ml-2">
                    Add gift wrap ($4.99)
                  </Label>

                  <div className="flex justify-between mt-2 mb-2">
                    <span>Shipping</span>
                    <span>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</span>
                  </div>
                  <Checkbox checked={expressShipping} onCheckedChange={(checked) => setExpressShipping(!!checked)} id="express" />
                  <Label htmlFor="express" className="ml-2">
                    Express Shipping ($9.99)
                  </Label>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-bold text-lg mb-2">
                    <span>Estimated Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>

                  <div className="flex justify-between font-bold text-xl mb-4">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                    />
                    <Button disabled={promoApplied || promoLoading} onClick={applyPromoCode}>
                      {promoLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Apply"}
                    </Button>
                  </div>

                  <Button className="w-full" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
