import { type NextRequest, NextResponse } from "next/server"
import type { Product } from "@/lib/api"

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: Product; timestamp: number }>()

function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

function extractPrice(priceString?: string): number {
  if (!priceString) return 0
  const match = priceString.match(/[\d,]+\.?\d*/g)
  return match ? parseFloat(match[0].replace(/,/g, "")) : 0
}

function mapToProduct(data: any, productId: string): Product {
  return {
    position: data.position || 1,
    title: data.title || `Product ${productId}`,
    link: data.link_clean || data.link || "",
    product_link: data.link_clean || data.link || "",
    product_id: data.asin || productId,
    serpapi_product_api: "",
    source: "Amazon",
    price: data.price || "$0.00",
    extracted_price: data.extracted_price || extractPrice(data.price),
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    thumbnail: data.thumbnail || "/placeholder.svg?height=400&width=400",
    delivery: data.delivery?.[0] || "Standard delivery",
    brand: data.specs?.brand || data.amazon_brand ? "Amazon" : "Generic",
    category: "electronics",
    description: data.snippet || data.title || "Product details not available",
    images: data.images || [data.thumbnail],
    specifications: {
      Brand: data.specs?.brand || data.amazon_brand ? "Amazon" : "Generic",
      Model: data.asin || productId,
      Type: "Electronics",
      ...(data.specs || {}),
      "Prime Eligible": data.prime ? "Yes" : "No",
      "Bought Last Month": data.bought_last_month || "N/A",
    },
  }
}

async function fetchProductFromAmazon(productId: string): Promise<Product | null> {
  try {
    const cacheKey = `product_${productId}`
    const cached = cache.get(cacheKey)
    if (cached && isValidCache(cached.timestamp)) {
      console.log("Returning cached product:", productId)
      return cached.data
    }

    const apiKey = process.env.SERPAPI_KEY
    if (!apiKey) throw new Error("SERPAPI_KEY not found in env")

    const searchUrl = `https://serpapi.com/search.json?engine=amazon&k=${productId}&amazon_domain=amazon.com&api_key=${apiKey}`

    console.log("Fetching from SerpAPI:", searchUrl)
    const response = await fetch(searchUrl)
    if (!response.ok) throw new Error(`API request failed: ${response.status}`)

    const data = await response.json()
    const organicResults = data.organic_results || []
    const productAds = data.product_ads?.products || []
    const allResults = [...organicResults, ...productAds]

    const foundProduct = allResults.find(
      (item: any) =>
        item.asin === productId ||
        item.product_id === productId ||
        item.link_clean?.includes(productId) ||
        item.link?.includes(productId),
    )

    if (foundProduct) {
      const product = mapToProduct(foundProduct, productId)
      cache.set(cacheKey, { data: product, timestamp: Date.now() })
      return product
    }

    return null
  } catch (err) {
    console.error("Failed to fetch product from SerpAPI:", err)
    return null
  }
}

function getFallbackProduct(productId: string): Product {
  return {
    position: 1,
    title: `Fallback Product (${productId})`,
    link: `https://www.amazon.com/dp/${productId}/`,
    product_link: `https://www.amazon.com/dp/${productId}/`,
    product_id: productId,
    serpapi_product_api: "",
    source: "Amazon",
    price: "$0.00",
    extracted_price: 0,
    rating: 0,
    reviews: 0,
    thumbnail: "/placeholder.svg?height=400&width=400",
    delivery: "Standard delivery",
    brand: "Unknown",
    category: "unknown",
    description: "Product details not available",
    images: ["/placeholder.svg?height=400&width=400"],
    specifications: {
      Brand: "Unknown",
      Model: productId,
      Type: "Unknown",
      "Prime Eligible": "Unknown",
      "Bought Last Month": "Unknown",
    },
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id
    console.log("Processing product ID:", productId)

    const product = await fetchProductFromAmazon(productId)
    const result = product ?? getFallbackProduct(productId)

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    })
  } catch (error) {
    console.error("API handler error:", error)
    const fallback = getFallbackProduct(params.id)
    return NextResponse.json(fallback, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    })
  }
}
