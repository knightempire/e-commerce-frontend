"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useCartStore } from "@/lib/cart-store"
import { productAPI, type Product } from "@/lib/api" // Ensure Product type is correctly imported
import { ShareModal } from "@/components/share-modal"
import {
  ArrowLeft,
  Clock,
  Zap,
  Gift,
  Percent,
  Star,
  Copy,
  Check,
  Timer,
  TrendingUp,
  ShoppingCart,
  Heart,
  Share2,
} from "lucide-react"

// Define an extended Product type for offers page if needed
interface OfferProduct extends Product {
  originalPrice?: number;
  salePrice?: number;
  discount?: number;
  timeLeft?: string;
  sold?: number;
  total?: number;
  isLimitedStock?: boolean;
  dealOfDay?: boolean; // For daily deals specific marking
}


export default function OffersPage() {
  const router = useRouter()
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null) // Type annotation
  const [flashSaleProducts, setFlashSaleProducts] = useState<OfferProduct[]>([])
  const [trendingProducts, setTrendingProducts] = useState<OfferProduct[]>([])
  const [dailyDealProducts, setDailyDealProducts] = useState<OfferProduct[]>([]) // New state for API-based daily deals
  const [loading, setLoading] = useState(true)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCartStore()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const apiResponse = await productAPI.searchProducts({ q: "electronics deals", num: 50 }) // Fetch a good variety

        if (apiResponse.products && apiResponse.products.length > 0) {
          const allFetchedProducts = apiResponse.products;

          // --- Flash Sale Products ---
          const phones = allFetchedProducts
            .filter(
              (p) =>
                p.category?.toLowerCase().includes("phone") ||
                p.title.toLowerCase().includes("iphone") ||
                p.title.toLowerCase().includes("samsung galaxy") ||
                p.title.toLowerCase().includes("pixel phone"),
            )
            .slice(0, 2)

          const laptops = allFetchedProducts
            .filter(
              (p) =>
                p.category?.toLowerCase().includes("laptop") ||
                p.title.toLowerCase().includes("macbook") ||
                p.title.toLowerCase().includes("dell xps") ||
                p.title.toLowerCase().includes("gaming laptop"),
            )
            .slice(0, 2)
          
          // Ensure we have enough unique products for flash sale
          let flashSaleSourceProducts = [...new Set([...phones, ...laptops])];
          if (flashSaleSourceProducts.length < 4 && allFetchedProducts.length >=4) {
            const needed = 4 - flashSaleSourceProducts.length;
            const additionalProducts = allFetchedProducts.filter(p => !flashSaleSourceProducts.some(sp => sp.product_id === p.product_id)).slice(0, needed);
            flashSaleSourceProducts.push(...additionalProducts);
          }


          const flashProductsData = flashSaleSourceProducts.map((product): OfferProduct => ({
            ...product,
            originalPrice: parseFloat((product.extracted_price * (1 + (Math.random() * 0.3 + 0.2))).toFixed(2)), // 20-50% markup
            salePrice: product.extracted_price,
            discount: Math.floor(Math.random() * 30) + 20, // 20-50% discount display
            timeLeft: `${Math.floor(Math.random() * 5) + 1}h ${Math.floor(Math.random() * 60)}m`,
            sold: Math.floor(Math.random() * 80) + 20,
            total: 100,
            isLimitedStock: Math.random() > 0.3,
          }))
          setFlashSaleProducts(flashProductsData)

          // --- Trending Products ---
          // Ensure we pick products not already in flash sale for variety
          const availableForTrending = allFetchedProducts.filter(p => !flashSaleSourceProducts.some(fp => fp.product_id === p.product_id));

          const trendingLaptop = availableForTrending
            .filter((p) => p.category?.toLowerCase().includes("laptop"))
            .slice(0, 1)
          const trendingPhone = availableForTrending
            .filter((p) => p.category?.toLowerCase().includes("phone"))
            .slice(0, 1)
          const keyboards = availableForTrending
            .filter((p) => p.category?.toLowerCase().includes("keyboard") || p.title.toLowerCase().includes("keyboard"))
            .slice(0, 2)
          const mouse = availableForTrending
            .filter((p) => p.category?.toLowerCase().includes("mouse") || p.title.toLowerCase().includes("mouse"))
            .slice(0, 1)
          const audio = availableForTrending
            .filter(
              (p) =>
                p.category?.toLowerCase().includes("audio") ||
                p.title.toLowerCase().includes("earbuds") ||
                p.title.toLowerCase().includes("headphones") ||
                p.title.toLowerCase().includes("airpods"),
            )
            .slice(0, 1)
          
          let trendingSourceProducts = [...new Set([...trendingLaptop, ...trendingPhone, ...keyboards, ...mouse, ...audio])];
           if (trendingSourceProducts.length < 5 && availableForTrending.length >=5) {
            const needed = 5 - trendingSourceProducts.length;
            const additionalProducts = availableForTrending.filter(p => !trendingSourceProducts.some(sp => sp.product_id === p.product_id)).slice(0, needed);
            trendingSourceProducts.push(...additionalProducts);
          }
          setTrendingProducts(trendingSourceProducts as OfferProduct[]);


          // --- Daily Deal Products (New - API based) ---
          // Take 5 random products from the remaining fetched products for daily deals
          // Ensure they are not in flash sale or trending
          const availableForDailyDeals = allFetchedProducts.filter(p => 
            !flashSaleSourceProducts.some(fp => fp.product_id === p.product_id) &&
            !trendingSourceProducts.some(tp => tp.product_id === p.product_id)
          );
          
          // Shuffle and pick 5
          const shuffledDailyDeals = [...availableForDailyDeals].sort(() => 0.5 - Math.random());
          const dailyDealSourceProducts = shuffledDailyDeals.slice(0, 5);

          const dailyDealsData = dailyDealSourceProducts.map((product, index): OfferProduct => ({
            ...product,
            originalPrice: parseFloat((product.extracted_price * (1 + (Math.random() * 0.2 + 0.1))).toFixed(2)), // 10-30% markup
            salePrice: product.extracted_price, // Or apply a slight discount
            discount: Math.floor(Math.random() * 20) + 10, // 10-30% discount display
            timeLeft: `${Math.floor(Math.random() * 20) + 4}h`, // Longer time for daily deals
            dealOfDay: index === 0, // Mark the first one as "Deal of the Day" for visual distinction
          }));
          setDailyDealProducts(dailyDealsData);

        } else {
            console.warn("No products received from API for offers page.");
            // Potentially set some hardcoded fallbacks if API fails completely
        }
      } catch (error) {
        console.error("Error fetching products for offers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const copyCoupon = (code: string) => { // Added type for code
    navigator.clipboard.writeText(code)
    setCopiedCoupon(code)
    setTimeout(() => setCopiedCoupon(null), 2000)
  }

  const handleProductClick = (productId: string) => {
    if(!productId) {
        console.error("Invalid product ID for navigation");
        return;
    }
    router.push(`/product/${productId}`)
  }

  const handleAddToCartLocal = (product: OfferProduct) => { // Use OfferProduct
    addToCart(product as Product, 1) // Cast to Product for store
    alert("Added to cart!")
  }

  const toggleWishlistLocal = (product: OfferProduct) => { // Use OfferProduct
    if (isInWishlist(product.product_id)) {
      removeFromWishlist(product.product_id)
    } else {
      addToWishlist(product as Product) // Cast to Product for store
    }
  }


  const coupons = [
    {
      id: 1, code: "SAVE20", title: "20% Off Everything", description: "Get 20% off on all products. Valid till midnight!",
      discount: "20%", minOrder: 100, maxDiscount: 50, validTill: "2024-12-31", category: "all",
      isPopular: true, usedCount: 1247, totalCount: 5000,
    },
    {
      id: 2, code: "FIRST50", title: "First Order Special", description: "Flat $50 off on your first order",
      discount: "$50", minOrder: 199, maxDiscount: 50, validTill: "2024-12-31", category: "new-user",
      isPopular: false, usedCount: 234, totalCount: 1000,
    },
    {
      id: 3, code: "AUDIO30", title: "Audio Gear Special", description: "30% off on all headphones and earbuds",
      discount: "30%", minOrder: 150, maxDiscount: 100, validTill: "2024-12-31", category: "headphones",
      isPopular: true, usedCount: 567, totalCount: 2000,
    },
  ]

  // Static bank offers (can also be fetched if dynamic)
  const bankOffers = [
    {
      id: 1, bank: "Global Bank", title: "10% Instant Discount", description: "Get 10% instant discount up to $100 on Global Bank Credit Cards",
      maxDiscount: 100, minOrder: 200, logo: "/placeholder.svg?height=40&width=40", // Replace with actual logo paths
    },
    {
      id: 2, bank: "MyBank", title: "5% Cashback", description: "Get 5% cashback up to $50 on MyBank Debit Cards",
      maxDiscount: 50, minOrder: 100, logo: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-orange-500 to-red-500 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Offers & Deals</h1>
                <p className="text-sm text-white/90">Save big on your favorite products</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 animate-pulse" />
              <span className="font-semibold">Deals Live!</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="flash-sale" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
            <TabsTrigger value="flash-sale" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Flash Sale
            </TabsTrigger>
            <TabsTrigger value="daily-deals" className="flex items-center gap-2"> {/* Changed from coupons to daily-deals */}
              <Clock className="h-4 w-4" />
              Daily Deals
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="bank-offers" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Bank Offers
            </TabsTrigger>
          </TabsList>

          {/* Flash Sale Tab */}
          <TabsContent value="flash-sale" className="space-y-6">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-lg shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-1">⚡ Flash Sale</h2>
                  <p className="text-white/90">Limited time offers - Grab them before they're gone!</p>
                </div>
                <div className="text-center mt-4 sm:mt-0">
                  <div className="text-2xl font-bold">02:33:10</div> {/* Consider making this dynamic */}
                  <div className="text-xs text-white/80">Time Left</div>
                </div>
              </div>
            </div>

            {loading && flashSaleProducts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={`flash-skeleton-${i}`} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-10 w-full mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : flashSaleProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {flashSaleProducts.map((product) => (
                  <Card key={product.product_id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                    <div className="relative">
                      <div
                        className="aspect-square relative cursor-pointer overflow-hidden"
                        onClick={() => handleProductClick(product.product_id)}
                      >
                        <Image
                          src={product.thumbnail || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <Badge className="absolute top-3 left-3 bg-red-600 text-white shadow-md">{product.discount}% OFF</Badge>
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/80 hover:bg-white rounded-full shadow-md h-8 w-8"
                          onClick={(e) => {e.stopPropagation(); toggleWishlistLocal(product)}}
                        >
                          <Heart
                            className={`h-4 w-4 ${isInWishlist(product.product_id) ? "fill-red-500 text-red-500" : "text-gray-700"}`}
                          />
                        </Button>
                        <ShareModal
                          url={`${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.product_id}`}
                          title={product.title}
                          description={`Amazing ${product.discount}% off deal!`}
                          price={`$${product.salePrice}`}
                          image={product.thumbnail}
                        >
                          <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white rounded-full shadow-md h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <Share2 className="h-4 w-4 text-gray-700" />
                          </Button>
                        </ShareModal>
                      </div>
                      {product.isLimitedStock && product.sold !== undefined && product.total !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Sold: {product.sold}</span>
                            <span>Available: {product.total - product.sold}</span>
                          </div>
                          <Progress value={(product.sold / product.total) * 100} className="h-1.5 bg-gray-600 [&>div]:bg-red-500" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3
                        className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleProductClick(product.product_id)}
                      >
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${ i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300" }`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews || 0})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold text-red-600">${product.salePrice?.toFixed(2)}</span>
                        {product.originalPrice && <span className="text-xs text-muted-foreground line-through">${product.originalPrice?.toFixed(2)}</span>}
                      </div>
                      {product.timeLeft && 
                        <div className="flex items-center gap-1 text-sm text-red-600 mb-3">
                          <Timer className="h-4 w-4" />
                          <span className="font-medium">{product.timeLeft} left</span>
                        </div>
                      }
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => handleAddToCartLocal(product)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
                 <div className="text-center py-10 text-muted-foreground">No flash sale products available right now.</div>
            )}
          </TabsContent>

          {/* Daily Deals Tab (Now API Based) */}
          <TabsContent value="daily-deals" className="space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-1">🌟 Daily Deals</h2>
              <p className="text-white/90">New deals every day - Don't miss out!</p>
            </div>

            {loading && dailyDealProducts.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {[...Array(4)].map((_, i) => (
                  <Card key={`daily-skeleton-${i}`} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-10 w-full mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : dailyDealProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dailyDealProducts.map((product) => (
                  <Card key={product.product_id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                    {product.dealOfDay && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-1.5 text-center text-xs font-bold">
                        ⭐ Deal of the Day
                      </div>
                    )}
                    <div className="relative">
                        <div className="aspect-square relative cursor-pointer overflow-hidden" onClick={() => handleProductClick(product.product_id)}>
                            <Image src={product.thumbnail || "/placeholder.svg"} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                        </div>
                        {product.discount && <Badge className="absolute top-3 left-3 bg-green-600 text-white shadow-md">{product.discount}% OFF</Badge>}
                         <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white rounded-full shadow-md h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleWishlistLocal(product)}}>
                                <Heart className={`h-4 w-4 ${isInWishlist(product.product_id) ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                            </Button>
                         </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductClick(product.product_id)}>{product.title}</h3>
                      <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                            </div>
                            <span className="text-xs text-muted-foreground">({product.reviews || 0})</span>
                        </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">${product.extracted_price?.toFixed(2)}</span>
                        {product.originalPrice && product.originalPrice > product.extracted_price && <span className="text-xs text-muted-foreground line-through">${product.originalPrice?.toFixed(2)}</span>}
                      </div>
                       {product.timeLeft && 
                        <div className="flex items-center gap-1 text-sm text-orange-600 mb-3">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">{product.timeLeft} left</span>
                        </div>
                        }
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAddToCartLocal(product)}>
                        <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">No daily deals available right now. Check back tomorrow!</div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
             <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-1">🔥 Trending Offers</h2>
                <p className="text-white/90">Most popular deals right now</p>
            </div>
            {loading && trendingProducts.length === 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                    <Card key={`trending-skeleton-${i}`} className="overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-10 w-full mt-2" />
                        </CardContent>
                    </Card>
                    ))}
                </div>
            ) : trendingProducts.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {trendingProducts.map((product) => (
                    <Card key={product.product_id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                        <div className="relative">
                            <div className="aspect-square relative cursor-pointer overflow-hidden" onClick={() => handleProductClick(product.product_id)}>
                                <Image src={product.thumbnail || "/placeholder.svg"} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                            </div>
                            <Badge className="absolute top-3 left-3 bg-pink-600 text-white shadow-md">Trending</Badge>
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white rounded-full shadow-md h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleWishlistLocal(product)}}>
                                    <Heart className={`h-4 w-4 ${isInWishlist(product.product_id) ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
                                </Button>
                                <ShareModal url={`${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.product_id}`} title={product.title} description="Check out this trending product!" price={`$${product.extracted_price}`} image={product.thumbnail}>
                                    <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white rounded-full shadow-md h-8 w-8" onClick={(e) => e.stopPropagation()}><Share2 className="h-4 w-4 text-gray-700" /></Button>
                                </ShareModal>
                            </div>
                        </div>
                        <CardContent className="p-4">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors" onClick={() => handleProductClick(product.product_id)}>{product.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />)}
                            </div>
                            <span className="text-xs text-muted-foreground">({product.reviews || 0})</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-lg font-bold text-gray-800">${product.extracted_price?.toFixed(2)}</span>
                            {/* Optionally show a small discount if calculated */}
                            {product.originalPrice && product.originalPrice > product.extracted_price && 
                                <Badge variant="destructive" className="text-xs">Hot Deal</Badge>
                            }
                        </div>
                        <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handleAddToCartLocal(product)}>
                            Shop Now
                        </Button>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-muted-foreground">No trending products found right now.</div>
            )}
          </TabsContent>
          
          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-1">🎫 Exclusive Coupons</h2>
              <p className="text-white/90">Save more with our exclusive coupon codes</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="overflow-hidden border-2 border-dashed border-gray-300 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0 flex">
                    <div className={`w-1/3 bg-gradient-to-br ${coupon.isPopular ? 'from-orange-400 to-pink-500' : 'from-gray-400 to-gray-600'} text-white p-4 sm:p-6 flex flex-col items-center justify-center rounded-l-md`}>
                      <Percent className="h-6 w-6 sm:h-8 sm:w-8 mb-1 sm:mb-2" />
                      <div className="text-xl sm:text-2xl font-bold">{coupon.discount}</div>
                      <div className="text-xs uppercase">Off</div>
                    </div>
                    <div className="w-2/3 p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-md sm:text-lg line-clamp-1">{coupon.title}</h3>
                        {coupon.isPopular && <Badge variant="destructive" className="ml-2 text-xs">Popular</Badge>}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{coupon.description}</p>
                      <div className="space-y-1 text-xs text-muted-foreground mb-3">
                        <div>Min order: ${coupon.minOrder}</div>
                        <div>Valid till: {new Date(coupon.validTill).toLocaleDateString()}</div>
                      </div>
                       <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded border-dashed border-2 border-gray-300 dark:border-gray-700">
                          <code className="font-mono font-bold text-gray-700 dark:text-gray-300">{coupon.code}</code>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => copyCoupon(coupon.code)} className="flex-shrink-0 h-9 w-9 p-0">
                          {copiedCoupon === coupon.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bank Offers Tab */}
          <TabsContent value="bank-offers" className="space-y-6">
             <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold mb-1">🏦 Bank Offers</h2>
                <p className="text-white/90">Extra savings with your bank cards</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankOffers.map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden border bg-white flex items-center justify-center">
                        <Image src={offer.logo || "/placeholder.svg"} alt={offer.bank} width={30} height={30} className="object-contain" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{offer.bank}</CardTitle>
                        <p className="text-sm text-primary font-medium">{offer.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{offer.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {offer.maxDiscount > 0 && <div>Max discount: ${offer.maxDiscount}</div>}
                      <div>Min order: ${offer.minOrder}</div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary/10">
                      View Details
                    </Button>
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