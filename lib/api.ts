export interface Product {
  position: number
  title: string
  link: string
  product_link: string
  product_id: string
  serpapi_product_api: string
  source: string
  price: string
  extracted_price: number
  rating: number
  reviews: number
  thumbnail: string
  delivery: string
  brand?: string
  category?: string
  description?: string
  images?: string[]
  specifications?: Record<string, any>
}

export interface ProductsResponse {
  products: Product[]
  pagination?: {
    current: number
    next?: string
    other_pages?: Record<string, string>
  }
  search_metadata: {
    total_results?: number
    time_taken?: number
  }
  error?: string
}

export interface SearchParams {
  q?: string
  start?: number
  num?: number
  sort_by?: "relevance" | "price_low_to_high" | "price_high_to_low" | "rating"
  min_price?: number
  max_price?: number
  rating?: number
  brand?: string
}

class ProductAPI {
  private baseUrl = "/api/products"

  async searchProducts(params: SearchParams = {}): Promise<ProductsResponse> {
    try {
      const searchParams = new URLSearchParams()

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })

      const url = `${this.baseUrl}?${searchParams.toString()}`
      console.log("Fetching from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Received ${data.products?.length || 0} products`)

      return data
    } catch (error) {
      console.error("Error in searchProducts:", error)
      throw error
    }
  }

  async getProductDetails(productId: string): Promise<Product | null> {
    try {
      const url = `${this.baseUrl}/${productId}`
      console.log("Fetching product details from:", url)

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received product details for:", productId)

      return data
    } catch (error) {
      console.error("Error in getProductDetails:", error)
      return null
    }
  }
}

export const productAPI = new ProductAPI()
