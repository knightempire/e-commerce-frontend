import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_KEY = process.env.SERPAPI_KEY
const BASE_URL = "https://serpapi.com/search.json"

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

// In-memory cache for the API route
const cache = new Map<string, { data: ProductsResponse; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

function getCacheKey(params: URLSearchParams): string {
  const sortedParams = new URLSearchParams()
  Array.from(params.entries())
    .sort()
    .forEach(([key, value]) => sortedParams.append(key, value))
  return sortedParams.toString()
}

function isValidCache(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION
}

function extractPrice(priceString?: string): number {
  if (!priceString) return 0
  const match = priceString.match(/[\d,]+\.?\d*/g)
  if (match) {
    return Number.parseFloat(match[0].replace(/,/g, ""))
  }
  return 0
}

function mapSortBy(sortBy?: string): string | undefined {
  switch (sortBy) {
    case "price_low_to_high":
      return "price_low_to_high"
    case "price_high_to_low":
      return "price_high_to_low"
    case "rating":
      return "rating"
    default:
      return undefined
  }
}

function applyFilters(products: any[], searchParams: URLSearchParams): Product[] {
  const minPrice = searchParams.get("min_price")
  const maxPrice = searchParams.get("max_price")
  const rating = searchParams.get("rating")
  const brand = searchParams.get("brand")

  let filteredProducts = products.map((item: any) => ({
    position: item.position || 0,
    title: item.title || "Unknown Product",
    link: item.link || "#",
    product_link: item.product_link || item.link || "#",
    product_id: item.product_id || `product_${item.position || Math.random()}`,
    serpapi_product_api: item.serpapi_product_api || "",
    source: item.source || "Google Shopping",
    price: item.price || "$0",
    extracted_price: extractPrice(item.price),
    rating: item.rating || 0,
    reviews: item.reviews || 0,
    thumbnail: item.thumbnail || "/placeholder.svg?height=300&width=300",
    delivery: item.delivery || "Standard delivery",
    brand: item.brand || item.source || "",
    category: item.category || "",
    description: item.snippet || "",
    images: item.images || [item.thumbnail],
    specifications: item.specifications || {},
  }))

  // Apply filters
  if (rating) {
    const minRating = Number.parseFloat(rating)
    filteredProducts = filteredProducts.filter((product: Product) => product.rating >= minRating)
  }

  if (minPrice) {
    const min = Number.parseFloat(minPrice)
    filteredProducts = filteredProducts.filter((product: Product) => product.extracted_price >= min)
  }

  if (maxPrice) {
    const max = Number.parseFloat(maxPrice)
    filteredProducts = filteredProducts.filter((product: Product) => product.extracted_price <= max)
  }

  if (brand) {
    const brands = brand.split(",").map((b) => b.toLowerCase().trim())
    filteredProducts = filteredProducts.filter((product: Product) =>
      brands.some((b) => product.brand?.toLowerCase().includes(b) || product.source?.toLowerCase().includes(b)),
    )
  }

  return filteredProducts
}

function getFallbackProducts(): ProductsResponse {
  const mockProducts: Product[] = [
    // Phones (2 products)
    {
      position: 1,
      title: "iPhone 15 Pro Max - 256GB",
      link: "#",
      product_link: "#",
      product_id: "fallback_1",
      serpapi_product_api: "",
      source: "Apple",
      price: "$1199.99",
      extracted_price: 1199.99,
      rating: 4.9,
      reviews: 5432,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Apple",
      category: "smartphone",
      description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Display: "6.7-inch Super Retina XDR",
        Chip: "A17 Pro",
        Storage: "256GB",
        Camera: "48MP Main + 12MP Ultra Wide",
        Battery: "Up to 29 hours video playback",
      },
    },
    {
      position: 2,
      title: "Samsung Galaxy S24 Ultra - 512GB",
      link: "#",
      product_link: "#",
      product_id: "fallback_2",
      serpapi_product_api: "",
      source: "Samsung",
      price: "$1299.99",
      extracted_price: 1299.99,
      rating: 4.7,
      reviews: 3876,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Samsung",
      category: "smartphone",
      description: "Premium Android flagship with S Pen, 200MP camera, and AI features.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Display: "6.8-inch Dynamic AMOLED 2X",
        Processor: "Snapdragon 8 Gen 3",
        Storage: "512GB",
        Camera: "200MP Main + 50MP Periscope",
        "S Pen": "Included",
      },
    },

    // Laptops (2 products)
    {
      position: 3,
      title: "MacBook Air M3 - 13 inch",
      link: "#",
      product_link: "#",
      product_id: "fallback_3",
      serpapi_product_api: "",
      source: "Apple",
      price: "$1099.99",
      extracted_price: 1099.99,
      rating: 4.8,
      reviews: 3245,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Apple",
      category: "laptop",
      description: "Ultra-thin laptop powered by M3 chip with all-day battery life.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Chip: "Apple M3",
        Display: "13.6-inch Liquid Retina",
        Memory: "8GB unified memory",
        Storage: "256GB SSD",
        Battery: "Up to 18 hours",
      },
    },
    {
      position: 4,
      title: "Dell XPS 13 Plus - Intel i7",
      link: "#",
      product_link: "#",
      product_id: "fallback_4",
      serpapi_product_api: "",
      source: "Dell",
      price: "$1299.99",
      extracted_price: 1299.99,
      rating: 4.6,
      reviews: 2187,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Dell",
      category: "laptop",
      description: "Premium ultrabook with edge-to-edge keyboard and stunning OLED display.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Processor: "Intel Core i7-1360P",
        Display: "13.4-inch OLED 3.5K",
        Memory: "16GB LPDDR5",
        Storage: "512GB SSD",
        Graphics: "Intel Iris Xe",
      },
    },

    // Shirts (2 products)
    {
      position: 5,
      title: "Men's Cotton Casual Shirt - Blue",
      link: "#",
      product_link: "#",
      product_id: "fallback_5",
      serpapi_product_api: "",
      source: "FashionCo",
      price: "$29.99",
      extracted_price: 29.99,
      rating: 4.3,
      reviews: 1247,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "FashionCo",
      category: "clothing",
      description: "Comfortable cotton shirt perfect for casual occasions.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "100% Cotton",
        Fit: "Regular Fit",
        Sleeve: "Long Sleeve",
        Care: "Machine Washable",
        Origin: "Made in USA",
      },
    },
    {
      position: 6,
      title: "Women's Silk Blouse - White",
      link: "#",
      product_link: "#",
      product_id: "fallback_6",
      serpapi_product_api: "",
      source: "ElegantWear",
      price: "$89.99",
      extracted_price: 89.99,
      rating: 4.6,
      reviews: 892,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "ElegantWear",
      category: "clothing",
      description: "Luxurious silk blouse for professional and formal occasions.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "100% Silk",
        Fit: "Slim Fit",
        Sleeve: "3/4 Sleeve",
        Care: "Dry Clean Only",
        Origin: "Made in Italy",
      },
    },

    // Bags (2 products)
    {
      position: 7,
      title: "Leather Business Backpack - Black",
      link: "#",
      product_link: "#",
      product_id: "fallback_7",
      serpapi_product_api: "",
      source: "LuxBags",
      price: "$149.99",
      extracted_price: 149.99,
      rating: 4.7,
      reviews: 1834,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "LuxBags",
      category: "accessories",
      description: "Premium leather backpack with laptop compartment and professional design.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Genuine Leather",
        Capacity: "25L",
        "Laptop Size": "Up to 15.6 inches",
        Pockets: "Multiple compartments",
        Warranty: "2 years",
      },
    },
    {
      position: 8,
      title: "Canvas Tote Bag - Beige",
      link: "#",
      product_link: "#",
      product_id: "fallback_8",
      serpapi_product_api: "",
      source: "EcoBags",
      price: "$24.99",
      extracted_price: 24.99,
      rating: 4.2,
      reviews: 956,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "EcoBags",
      category: "accessories",
      description: "Eco-friendly canvas tote bag perfect for shopping and daily use.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "100% Cotton Canvas",
        Dimensions: "16 x 14 x 6 inches",
        Handle: "22-inch handles",
        Care: "Machine washable",
        "Eco-Friendly": "Yes",
      },
    },

    // Shoes (2 products)
    {
      position: 9,
      title: "Men's Running Shoes - Black/White",
      link: "#",
      product_link: "#",
      product_id: "fallback_9",
      serpapi_product_api: "",
      source: "SportsTech",
      price: "$129.99",
      extracted_price: 129.99,
      rating: 4.5,
      reviews: 2341,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "SportsTech",
      category: "footwear",
      description: "High-performance running shoes with advanced cushioning technology.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Upper: "Mesh with synthetic overlays",
        Sole: "Rubber outsole",
        Cushioning: "Air cushioning system",
        Drop: "10mm heel-to-toe drop",
        Weight: "10.5 oz (men's size 9)",
      },
    },
    {
      position: 10,
      title: "Women's High Heels - Red",
      link: "#",
      product_link: "#",
      product_id: "fallback_10",
      serpapi_product_api: "",
      source: "GlamShoes",
      price: "$79.99",
      extracted_price: 79.99,
      rating: 4.3,
      reviews: 678,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "GlamShoes",
      category: "footwear",
      description: "Elegant high heel shoes perfect for formal events and parties.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Patent leather",
        "Heel Height": "4 inches",
        Closure: "Buckle strap",
        Sole: "Leather sole",
        Fit: "True to size",
      },
    },

    // Wallets (2 products)
    {
      position: 11,
      title: "Genuine Leather Wallet - Brown",
      link: "#",
      product_link: "#",
      product_id: "fallback_11",
      serpapi_product_api: "",
      source: "LeatherCraft",
      price: "$49.99",
      extracted_price: 49.99,
      rating: 4.6,
      reviews: 1456,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "LeatherCraft",
      category: "accessories",
      description: "Handcrafted genuine leather wallet with RFID blocking technology.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Full-grain leather",
        Slots: "8 card slots",
        Bills: "2 bill compartments",
        "RFID Blocking": "Yes",
        Dimensions: "4.5 x 3.5 x 0.4 inches",
      },
    },
    {
      position: 12,
      title: "Minimalist Card Holder - Black",
      link: "#",
      product_link: "#",
      product_id: "fallback_12",
      serpapi_product_api: "",
      source: "ModernWallet",
      price: "$19.99",
      extracted_price: 19.99,
      rating: 4.4,
      reviews: 789,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "ModernWallet",
      category: "accessories",
      description: "Slim card holder with aluminum construction and RFID protection.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Aluminum + Leather",
        Capacity: "6-12 cards",
        Weight: "2.1 oz",
        "RFID Blocking": "Yes",
        Dimensions: "3.5 x 2.5 x 0.5 inches",
      },
    },

    // Keyboards (2 products)
    {
      position: 13,
      title: "Mechanical Gaming Keyboard RGB",
      link: "#",
      product_link: "#",
      product_id: "fallback_13",
      serpapi_product_api: "",
      source: "GameTech",
      price: "$149.99",
      extracted_price: 149.99,
      rating: 4.5,
      reviews: 2156,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "GameTech",
      category: "gaming",
      description: "Professional gaming keyboard with mechanical switches and customizable RGB lighting.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Switch Type": "Cherry MX Blue",
        Backlighting: "RGB per-key",
        Layout: "Full-size 104 keys",
        Connection: "USB-C",
        "Polling Rate": "1000Hz",
      },
    },
    {
      position: 14,
      title: "Wireless Office Keyboard - White",
      link: "#",
      product_link: "#",
      product_id: "fallback_14",
      serpapi_product_api: "",
      source: "OfficeMax",
      price: "$59.99",
      extracted_price: 59.99,
      rating: 4.2,
      reviews: 1234,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "OfficeMax",
      category: "office",
      description: "Quiet wireless keyboard perfect for office work and productivity.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Key Type": "Scissor switch",
        Connection: "2.4GHz wireless",
        Battery: "2 AAA batteries",
        Range: "33 feet",
        Compatibility: "Windows, Mac, Linux",
      },
    },

    // Mice (2 products)
    {
      position: 15,
      title: "Wireless Gaming Mouse Pro",
      link: "#",
      product_link: "#",
      product_id: "fallback_15",
      serpapi_product_api: "",
      source: "GameTech",
      price: "$89.99",
      extracted_price: 89.99,
      rating: 4.4,
      reviews: 1834,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "GameTech",
      category: "gaming",
      description: "High-precision wireless gaming mouse with customizable buttons and RGB lighting.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        DPI: "25,600 DPI",
        Buttons: "11 programmable",
        Battery: "70 hours",
        Connection: "2.4GHz wireless + Bluetooth",
        Weight: "85g",
      },
    },
    {
      position: 16,
      title: "Ergonomic Wireless Mouse",
      link: "#",
      product_link: "#",
      product_id: "fallback_16",
      serpapi_product_api: "",
      source: "ErgoTech",
      price: "$39.99",
      extracted_price: 39.99,
      rating: 4.3,
      reviews: 987,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "ErgoTech",
      category: "office",
      description: "Comfortable ergonomic mouse designed to reduce wrist strain during long work sessions.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        DPI: "1600 DPI",
        Buttons: "5 buttons",
        Battery: "12 months",
        Connection: "2.4GHz wireless",
        Design: "Vertical ergonomic",
      },
    },

    // Headphones (2 products)
    {
      position: 17,
      title: "Premium Wireless Headphones - Noise Cancelling",
      link: "#",
      product_link: "#",
      product_id: "fallback_17",
      serpapi_product_api: "",
      source: "AudioTech",
      price: "$299.99",
      extracted_price: 299.99,
      rating: 4.8,
      reviews: 2847,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "AudioTech",
      category: "audio",
      description:
        "Experience crystal-clear audio with active noise cancellation, 30-hour battery life, and premium comfort padding.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Driver Size": "40mm",
        "Frequency Response": "20Hz - 20kHz",
        "Battery Life": "30 hours",
        Connectivity: "Bluetooth 5.0",
        Weight: "250g",
      },
    },
    {
      position: 18,
      title: "Wireless Earbuds Pro - True Wireless",
      link: "#",
      product_link: "#",
      product_id: "fallback_18",
      serpapi_product_api: "",
      source: "SoundMax",
      price: "$199.99",
      extracted_price: 199.99,
      rating: 4.6,
      reviews: 1523,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "SoundMax",
      category: "audio",
      description: "Compact design with premium sound quality and active noise cancellation.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Driver Size": "12mm",
        "Battery Life": "8 hours + 24 hours case",
        Connectivity: "Bluetooth 5.2",
        "Water Resistance": "IPX4",
      },
    },

    // Watches (2 products)
    {
      position: 19,
      title: "Apple Watch Series 9 - 45mm",
      link: "#",
      product_link: "#",
      product_id: "fallback_19",
      serpapi_product_api: "",
      source: "Apple",
      price: "$429.99",
      extracted_price: 429.99,
      rating: 4.7,
      reviews: 4321,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Apple",
      category: "smartwatch",
      description: "Advanced health monitoring and fitness tracking with always-on display.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Display: "45mm Always-On Retina",
        Chip: "S9 SiP",
        Health: "ECG, Blood Oxygen, Temperature",
        Battery: "Up to 18 hours",
        "Water Resistance": "50 meters",
      },
    },
    {
      position: 20,
      title: "Classic Analog Watch - Silver",
      link: "#",
      product_link: "#",
      product_id: "fallback_20",
      serpapi_product_api: "",
      source: "TimeCraft",
      price: "$199.99",
      extracted_price: 199.99,
      rating: 4.4,
      reviews: 1567,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "TimeCraft",
      category: "watch",
      description: "Elegant analog watch with Swiss movement and sapphire crystal.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Movement: "Swiss Quartz",
        "Case Material": "Stainless Steel",
        Crystal: "Sapphire",
        "Water Resistance": "100m",
        Strap: "Leather",
      },
    },

    // Gaming Accessories (2 products)
    {
      position: 21,
      title: "Gaming Chair - Ergonomic Design",
      link: "#",
      product_link: "#",
      product_id: "fallback_21",
      serpapi_product_api: "",
      source: "GameSeats",
      price: "$299.99",
      extracted_price: 299.99,
      rating: 4.5,
      reviews: 1789,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "GameSeats",
      category: "gaming",
      description: "Professional gaming chair with lumbar support and adjustable features.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "PU Leather",
        "Weight Capacity": "300 lbs",
        Adjustable: "Height, armrests, recline",
        "Lumbar Support": "Yes",
        Warranty: "3 years",
      },
    },
    {
      position: 22,
      title: "Gaming Headset RGB - Surround Sound",
      link: "#",
      product_link: "#",
      product_id: "fallback_22",
      serpapi_product_api: "",
      source: "GameSound",
      price: "$129.99",
      extracted_price: 129.99,
      rating: 4.4,
      reviews: 1234,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "GameSound",
      category: "gaming",
      description: "Immersive gaming audio with RGB lighting and crystal-clear microphone.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Driver Size": "50mm",
        Microphone: "Detachable",
        "RGB Lighting": "Yes",
        Connectivity: "USB + 3.5mm",
      },
    },

    // Home Decor (2 products)
    {
      position: 23,
      title: "Modern Table Lamp - LED",
      link: "#",
      product_link: "#",
      product_id: "fallback_23",
      serpapi_product_api: "",
      source: "HomeLights",
      price: "$79.99",
      extracted_price: 79.99,
      rating: 4.3,
      reviews: 892,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "HomeLights",
      category: "home",
      description: "Sleek LED table lamp with adjustable brightness and modern design.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Light Source": "LED",
        Brightness: "Adjustable",
        "Color Temperature": "3000K-6000K",
        Power: "12W",
        Material: "Aluminum",
      },
    },
    {
      position: 24,
      title: "Decorative Wall Art - Abstract",
      link: "#",
      product_link: "#",
      product_id: "fallback_24",
      serpapi_product_api: "",
      source: "ArtSpace",
      price: "$149.99",
      extracted_price: 149.99,
      rating: 4.6,
      reviews: 567,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "ArtSpace",
      category: "home",
      description: "Beautiful abstract wall art to enhance your living space.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Canvas",
        Frame: "Wooden frame included",
        Size: "24 x 36 inches",
        Style: "Abstract modern",
        "Ready to Hang": "Yes",
      },
    },

    // Kitchen Appliances (2 products)
    {
      position: 25,
      title: "Stainless Steel Coffee Maker",
      link: "#",
      product_link: "#",
      product_id: "fallback_25",
      serpapi_product_api: "",
      source: "KitchenPro",
      price: "$189.99",
      extracted_price: 189.99,
      rating: 4.5,
      reviews: 1345,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "KitchenPro",
      category: "kitchen",
      description: "Premium coffee maker with programmable features and thermal carafe.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Capacity: "12 cups",
        Carafe: "Thermal stainless steel",
        Timer: "24-hour programmable",
        "Auto Shut-off": "Yes",
        Filter: "Permanent gold-tone",
      },
    },
    {
      position: 26,
      title: "Air Fryer - 5.8QT Capacity",
      link: "#",
      product_link: "#",
      product_id: "fallback_26",
      serpapi_product_api: "",
      source: "CookSmart",
      price: "$129.99",
      extracted_price: 129.99,
      rating: 4.7,
      reviews: 2341,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "CookSmart",
      category: "kitchen",
      description: "Large capacity air fryer for healthy cooking with less oil.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Capacity: "5.8 Quarts",
        Temperature: "180°F - 400°F",
        Timer: "60 minutes",
        Power: "1700W",
        "Non-stick": "Yes",
      },
    },

    // Books (2 products)
    {
      position: 27,
      title: "Programming Book - Python Complete Guide",
      link: "#",
      product_link: "#",
      product_id: "fallback_27",
      serpapi_product_api: "",
      source: "TechBooks",
      price: "$49.99",
      extracted_price: 49.99,
      rating: 4.8,
      reviews: 1876,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "TechBooks",
      category: "books",
      description: "Comprehensive guide to Python programming for beginners and experts.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Pages: "850 pages",
        Author: "Tech Expert",
        Edition: "2024 Edition",
        Format: "Paperback",
        Language: "English",
      },
    },
    {
      position: 28,
      title: "Fiction Novel - Mystery Thriller",
      link: "#",
      product_link: "#",
      product_id: "fallback_28",
      serpapi_product_api: "",
      source: "BookWorld",
      price: "$19.99",
      extracted_price: 19.99,
      rating: 4.4,
      reviews: 987,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "BookWorld",
      category: "books",
      description: "Gripping mystery thriller that will keep you on the edge of your seat.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Pages: "320 pages",
        Author: "Mystery Writer",
        Genre: "Thriller/Mystery",
        Format: "Paperback",
        "Publication Year": "2024",
      },
    },

    // Fitness Equipment (2 products)
    {
      position: 29,
      title: "Yoga Mat - Non-Slip Premium",
      link: "#",
      product_link: "#",
      product_id: "fallback_29",
      serpapi_product_api: "",
      source: "FitnessPro",
      price: "$39.99",
      extracted_price: 39.99,
      rating: 4.6,
      reviews: 1234,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "FitnessPro",
      category: "fitness",
      description: "High-quality yoga mat with superior grip and cushioning.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "TPE (eco-friendly)",
        Thickness: "6mm",
        Size: "72 x 24 inches",
        "Non-slip": "Yes",
        "Carrying Strap": "Included",
      },
    },
    {
      position: 30,
      title: "Resistance Bands Set - 5 Levels",
      link: "#",
      product_link: "#",
      product_id: "fallback_30",
      serpapi_product_api: "",
      source: "WorkoutGear",
      price: "$29.99",
      extracted_price: 29.99,
      rating: 4.4,
      reviews: 876,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "WorkoutGear",
      category: "fitness",
      description: "Complete resistance bands set for full-body workout routines.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Levels: "5 resistance levels",
        Material: "Natural latex",
        Handles: "Comfort grip",
        "Door Anchor": "Included",
        "Exercise Guide": "Yes",
      },
    },

    // Beauty Products (2 products)
    {
      position: 31,
      title: "Skincare Set - Anti-Aging",
      link: "#",
      product_link: "#",
      product_id: "fallback_31",
      serpapi_product_api: "",
      source: "BeautyLab",
      price: "$89.99",
      extracted_price: 89.99,
      rating: 4.5,
      reviews: 1567,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "BeautyLab",
      category: "beauty",
      description: "Complete anti-aging skincare routine with premium ingredients.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Set: "Cleanser, serum, moisturizer",
        "Skin Type": "All skin types",
        Ingredients: "Retinol, Vitamin C, Hyaluronic Acid",
        "Cruelty Free": "Yes",
        "Paraben Free": "Yes",
      },
    },
    {
      position: 32,
      title: "Hair Dryer - Professional Grade",
      link: "#",
      product_link: "#",
      product_id: "fallback_32",
      serpapi_product_api: "",
      source: "SalonPro",
      price: "$159.99",
      extracted_price: 159.99,
      rating: 4.7,
      reviews: 2134,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "SalonPro",
      category: "beauty",
      description: "Professional-grade hair dryer with ionic technology and multiple heat settings.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Power: "1875W",
        Technology: "Ionic",
        "Heat Settings": "3 heat, 2 speed",
        Attachments: "2 concentrators, diffuser",
        Cord: "9 feet",
      },
    },

    // Pet Supplies (2 products)
    {
      position: 33,
      title: "Dog Bed - Memory Foam Large",
      link: "#",
      product_link: "#",
      product_id: "fallback_33",
      serpapi_product_api: "",
      source: "PetComfort",
      price: "$79.99",
      extracted_price: 79.99,
      rating: 4.6,
      reviews: 1345,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "PetComfort",
      category: "pets",
      description: "Orthopedic memory foam dog bed for ultimate comfort and joint support.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Size: "Large (36 x 24 inches)",
        Material: "Memory foam",
        Cover: "Removable, washable",
        "Non-slip": "Yes",
        "Weight Capacity": "Up to 100 lbs",
      },
    },
    {
      position: 34,
      title: "Cat Litter Box - Self-Cleaning",
      link: "#",
      product_link: "#",
      product_id: "fallback_34",
      serpapi_product_api: "",
      source: "SmartPets",
      price: "$249.99",
      extracted_price: 249.99,
      rating: 4.3,
      reviews: 789,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "SmartPets",
      category: "pets",
      description: "Automatic self-cleaning litter box with smart sensors and odor control.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Type: "Self-cleaning",
        Sensors: "Motion and weight",
        Capacity: "Large cats up to 15 lbs",
        "Power Source": "AC adapter",
        "Odor Control": "Carbon filter",
      },
    },

    // Automotive (2 products)
    {
      position: 35,
      title: "Car Phone Mount - Magnetic",
      link: "#",
      product_link: "#",
      product_id: "fallback_35",
      serpapi_product_api: "",
      source: "AutoTech",
      price: "$24.99",
      extracted_price: 24.99,
      rating: 4.4,
      reviews: 1876,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "AutoTech",
      category: "automotive",
      description: "Strong magnetic car phone mount with 360-degree rotation.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Mount: "Dashboard/windshield",
        Rotation: "360 degrees",
        Compatibility: "All smartphones",
        Magnet: "Strong neodymium",
        Installation: "Tool-free",
      },
    },
    {
      position: 36,
      title: "Car Dash Cam - 4K Recording",
      link: "#",
      product_link: "#",
      product_id: "fallback_36",
      serpapi_product_api: "",
      source: "DriveSafe",
      price: "$149.99",
      extracted_price: 149.99,
      rating: 4.5,
      reviews: 1234,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "DriveSafe",
      category: "automotive",
      description: "High-resolution dash cam with night vision and parking mode.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Resolution: "4K Ultra HD",
        "Night Vision": "Yes",
        Storage: "Supports up to 128GB",
        "G-Sensor": "Yes",
        "Loop Recording": "Yes",
      },
    },

    // Tablets (2 products)
    {
      position: 37,
      title: "iPad Pro 12.9-inch M2",
      link: "#",
      product_link: "#",
      product_id: "fallback_37",
      serpapi_product_api: "",
      source: "Apple",
      price: "$1099.99",
      extracted_price: 1099.99,
      rating: 4.8,
      reviews: 1987,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Apple",
      category: "tablet",
      description: "Professional tablet with M2 chip and Liquid Retina XDR display.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Display: "12.9-inch Liquid Retina XDR",
        Chip: "Apple M2",
        Storage: "128GB",
        Camera: "12MP Wide + 10MP Ultra Wide",
        "Apple Pencil": "2nd generation support",
      },
    },
    {
      position: 38,
      title: "Samsung Galaxy Tab S9 Ultra",
      link: "#",
      product_link: "#",
      product_id: "fallback_38",
      serpapi_product_api: "",
      source: "Samsung",
      price: "$1199.99",
      extracted_price: 1199.99,
      rating: 4.6,
      reviews: 1543,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "Samsung",
      category: "tablet",
      description: "Large premium Android tablet with S Pen and desktop-class performance.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Display: "14.6-inch Dynamic AMOLED 2X",
        Processor: "Snapdragon 8 Gen 2",
        Memory: "12GB RAM",
        Storage: "256GB",
        "S Pen": "Included",
      },
    },

    // Cameras (2 products)
    {
      position: 39,
      title: "DSLR Camera - Professional",
      link: "#",
      product_link: "#",
      product_id: "fallback_39",
      serpapi_product_api: "",
      source: "PhotoPro",
      price: "$1299.99",
      extracted_price: 1299.99,
      rating: 4.7,
      reviews: 1456,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "PhotoPro",
      category: "camera",
      description: "Professional DSLR camera with 24MP sensor and 4K video recording.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Sensor: "24MP APS-C",
        "Video Recording": "4K at 30fps",
        "ISO Range": "100-25600",
        Autofocus: "45-point AF system",
        "Battery Life": "950 shots",
      },
    },
    {
      position: 40,
      title: "Action Camera - Waterproof 4K",
      link: "#",
      product_link: "#",
      product_id: "fallback_40",
      serpapi_product_api: "",
      source: "AdventureCam",
      price: "$199.99",
      extracted_price: 199.99,
      rating: 4.4,
      reviews: 2134,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "AdventureCam",
      category: "camera",
      description: "Rugged action camera for extreme sports and outdoor adventures.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Resolution: "4K at 60fps",
        Waterproof: "Up to 30m",
        Stabilization: "Electronic image stabilization",
        "Battery Life": "2 hours recording",
        Accessories: "Mounting kit included",
      },
    },

    // Smart Home (2 products)
    {
      position: 41,
      title: "Smart Thermostat - WiFi Enabled",
      link: "#",
      product_link: "#",
      product_id: "fallback_41",
      serpapi_product_api: "",
      source: "SmartHome",
      price: "$199.99",
      extracted_price: 199.99,
      rating: 4.5,
      reviews: 1678,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "SmartHome",
      category: "smart_home",
      description: "Programmable smart thermostat with energy saving features and mobile app control.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Connectivity: "WiFi",
        Compatibility: "Alexa, Google Assistant",
        Display: "Color touchscreen",
        "Energy Star": "Yes",
        Installation: "C-wire required",
      },
    },
    {
      position: 42,
      title: "Smart Light Bulb Set - Color Changing",
      link: "#",
      product_link: "#",
      product_id: "fallback_42",
      serpapi_product_api: "",
      source: "BrightTech",
      price: "$79.99",
      extracted_price: 79.99,
      rating: 4.3,
      reviews: 1234,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "BrightTech",
      category: "smart_home",
      description: "RGB smart bulbs with voice control and smartphone app integration.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Colors: "16 million colors",
        Brightness: "800 lumens",
        "Voice Control": "Alexa, Google Assistant",
        "App Control": "Yes",
        "Energy Efficient": "9W LED",
      },
    },

    // Office Supplies (2 products)
    {
      position: 43,
      title: "Ergonomic Office Chair - Mesh Back",
      link: "#",
      product_link: "#",
      product_id: "fallback_43",
      serpapi_product_api: "",
      source: "OfficeComfort",
      price: "$249.99",
      extracted_price: 249.99,
      rating: 4.6,
      reviews: 1876,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "OfficeComfort",
      category: "office",
      description: "Professional office chair with lumbar support and breathable mesh design.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Mesh back, fabric seat",
        "Weight Capacity": "300 lbs",
        Adjustments: "Height, tilt, lumbar, armrests",
        "Gas Cylinder": "Class 4",
        Warranty: "5 years",
      },
    },
    {
      position: 44,
      title: "Standing Desk - Electric Height Adjustable",
      link: "#",
      product_link: "#",
      product_id: "fallback_44",
      serpapi_product_api: "",
      source: "DeskPro",
      price: "$399.99",
      extracted_price: 399.99,
      rating: 4.5,
      reviews: 1345,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "DeskPro",
      category: "office",
      description: "Electric standing desk with memory presets and cable management.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Height Range": "28-48 inches",
        "Desktop Size": "48 x 30 inches",
        "Weight Capacity": "180 lbs",
        "Memory Presets": "4 positions",
        Motor: "Dual motor system",
      },
    },

    // Sports Equipment (2 products)
    {
      position: 45,
      title: "Basketball - Official Size",
      link: "#",
      product_link: "#",
      product_id: "fallback_45",
      serpapi_product_api: "",
      source: "SportsBall",
      price: "$29.99",
      extracted_price: 29.99,
      rating: 4.4,
      reviews: 987,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "SportsBall",
      category: "sports",
      description: "Official size basketball with superior grip and durability.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Size: "Official (Size 7)",
        Material: "Composite leather",
        "Indoor/Outdoor": "Both",
        Weight: "22 oz",
        "Deep Channel": "Yes",
      },
    },
    {
      position: 46,
      title: "Tennis Racket - Professional Grade",
      link: "#",
      product_link: "#",
      product_id: "fallback_46",
      serpapi_product_api: "",
      source: "TennisGear",
      price: "$149.99",
      extracted_price: 149.99,
      rating: 4.6,
      reviews: 1456,
      thumbnail: "/placeholder.svg?height=600&width=600",
      delivery: "Free delivery",
      brand: "TennisGear",
      category: "sports",
      description: "High-performance tennis racket for intermediate to advanced players.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        "Head Size": "100 sq in",
        Weight: "10.6 oz",
        "String Pattern": "16x19",
        "Grip Size": "4 3/8",
        Material: "Graphite composite",
      },
    },

    // Tools (2 products)
    {
      position: 47,
      title: "Cordless Drill Set - 20V",
      link: "#",
      product_link: "#",
      product_id: "fallback_47",
      serpapi_product_api: "",
      source: "ToolMaster",
      price: "$129.99",
      extracted_price: 129.99,
      rating: 4.5,
      reviews: 2134,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "ToolMaster",
      category: "tools",
      description: "Powerful cordless drill with LED light and complete bit set.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Voltage: "20V Lithium-ion",
        Torque: "350 in-lbs",
        "Chuck Size": "1/2 inch",
        "LED Light": "Yes",
        Accessories: "29-piece bit set",
      },
    },
    {
      position: 48,
      title: "Tool Box - Heavy Duty Steel",
      link: "#",
      product_link: "#",
      product_id: "fallback_48",
      serpapi_product_api: "",
      source: "StoragePro",
      price: "$89.99",
      extracted_price: 89.99,
      rating: 4.3,
      reviews: 876,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "StoragePro",
      category: "tools",
      description: "Durable steel toolbox with multiple compartments and secure locking.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Material: "Heavy-duty steel",
        Dimensions: "26 x 12 x 12 inches",
        Compartments: "5 drawers + top tray",
        Lock: "Keyed lock",
        "Weight Capacity": "150 lbs",
      },
    },

    // Jewelry (2 products)
    {
      position: 49,
      title: "Diamond Stud Earrings - 14K Gold",
      link: "#",
      product_link: "#",
      product_id: "fallback_49",
      serpapi_product_api: "",
      source: "LuxJewelry",
      price: "$299.99",
      extracted_price: 299.99,
      rating: 4.8,
      reviews: 567,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "LuxJewelry",
      category: "jewelry",
      description: "Elegant diamond stud earrings in 14K white gold setting.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Metal: "14K White Gold",
        "Diamond Cut": "Round Brilliant",
        "Carat Weight": "0.5 CT total",
        Clarity: "SI1-SI2",
        "Color Grade": "G-H",
      },
    },
    {
      position: 50,
      title: "Men's Watch - Luxury Automatic",
      link: "#",
      product_link: "#",
      product_id: "fallback_50",
      serpapi_product_api: "",
      source: "TimeElite",
      price: "$599.99",
      extracted_price: 599.99,
      rating: 4.7,
      reviews: 1234,
      thumbnail: "/placeholder.svg?height=300&width=300",
      delivery: "Free delivery",
      brand: "TimeElite",
      category: "jewelry",
      description: "Premium automatic watch with sapphire crystal and leather band.",
      images: ["/placeholder.svg?height=600&width=600", "/placeholder.svg?height=600&width=600"],
      specifications: {
        Movement: "Automatic mechanical",
        "Case Material": "Stainless steel",
        Crystal: "Sapphire",
        "Water Resistance": "200m",
        Strap: "Genuine leather",
      },
    },
  ]

  return {
    products: mockProducts,
    search_metadata: { total_results: mockProducts.length },
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cacheKey = getCacheKey(searchParams)

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && isValidCache(cached.timestamp)) {
      console.log("Returning cached data")
      return NextResponse.json(cached.data)
    }

    const query =
      searchParams.get("q") || "mixed products electronics phones laptops shirts bags shoes wallets keyboards mice"
    const start = searchParams.get("start") || "0"
    const num = searchParams.get("num") || "20"
    const sortBy = searchParams.get("sort_by")

    console.log(`Fetching products for query: ${query}`)

    const response = await axios.get(BASE_URL, {
      params: {
        engine: "amazon",
        k: query,
        amazon_domain: "amazon.com",
        api_key: API_KEY,
        start: Number.parseInt(start),
      },
      timeout: 15000,
    })

    // Combine product_ads and organic_results
    let allProducts = []
    if (response.data.product_ads?.products) {
      allProducts = allProducts.concat(response.data.product_ads.products)
    }
    if (response.data.organic_results) {
      allProducts = allProducts.concat(response.data.organic_results)
    }

    let products = allProducts.map((item: any, index: number) => ({
      position: item.position || index + 1,
      title: item.title || "Unknown Product",
      link: item.link_clean || item.link || "#",
      product_link: item.link_clean || item.link || "#",
      product_id: item.asin || `product_${item.position || Math.random()}`,
      serpapi_product_api: "",
      source: item.sponsored ? "Sponsored" : "Amazon",
      price: item.price || "$0",
      extracted_price: item.extracted_price || extractPrice(item.price),
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      thumbnail: item.thumbnail || "/placeholder.svg?height=300&width=300",
      delivery: item.delivery ? item.delivery.join(", ") : "Standard delivery",
      brand: item.title?.split(" ")[0] || "Amazon",
      category: item.tags ? item.tags.join(", ") : "",
      description: item.title || "",
      images: [item.thumbnail || "/placeholder.svg?height=300&width=300"],
      specifications: {
        ASIN: item.asin,
        Prime: item.prime ? "Yes" : "No",
        "Bought Last Month": item.bought_last_month || "",
        "Price Unit": item.price_unit || "",
        "Old Price": item.old_price || "",
        Offers: item.offers ? item.offers.join(", ") : "",
        "SNAP EBT": item.snap_ebt_eligible ? "Yes" : "No",
        "Small Business": item.small_business ? "Yes" : "No",
      },
    }))

    // Apply client-side filters and sorting
    products = applyFilters(products, searchParams)

    // Apply sorting if not handled by API
    if (sortBy && sortBy !== "relevance") {
      products.sort((a: Product, b: Product) => {
        switch (sortBy) {
          case "price_low_to_high":
            return a.extracted_price - b.extracted_price
          case "price_high_to_low":
            return b.extracted_price - a.extracted_price
          case "rating":
            return b.rating - a.rating
          default:
            return 0
        }
      })
    }

    const result: ProductsResponse = {
      products,
      pagination: {
        current: 1,
        next: response.data.search_information?.page ? `${response.data.search_information.page + 1}` : undefined,
      },
      search_metadata: {
        total_results: response.data.search_information?.total_results || products.length,
        time_taken: response.data.search_metadata?.total_time_taken,
      },
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    })

    console.log(`Successfully fetched ${products.length} products`)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching products:", error)

    // Return fallback data with error indication
    const fallbackData = getFallbackProducts()
    return NextResponse.json({
      ...fallbackData,
      error: "API temporarily unavailable, showing sample data",
    })
  }
}
