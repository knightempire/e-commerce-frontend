"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/lib/api"

export interface CartItem extends Product {
  quantity: number
  selectedVariants?: {
    color?: string
    size?: string
  }
}

export interface WishlistItem extends Product {}

interface CartStore {
  // Cart
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number

  // Wishlist
  wishlistItems: WishlistItem[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  moveToCart: (productId: string) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Cart state
      cartItems: [],

      // Cart actions
      addToCart: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.cartItems.find((item) => item.product_id === product.product_id)

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product_id === product.product_id ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            }
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                ...product,
                quantity,
                selectedVariants: { color: "default", size: "standard" },
              },
            ],
          }
        })
      },

      removeFromCart: (productId: string) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.product_id !== productId),
        }))
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set((state) => ({
          cartItems: state.cartItems.map((item) => (item.product_id === productId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => {
        set({ cartItems: [] })
      },

      getCartTotal: () => {
        const { cartItems } = get()
        return cartItems.reduce((total, item) => total + item.extracted_price * item.quantity, 0)
      },

      getCartCount: () => {
        const { cartItems } = get()
        return cartItems.reduce((count, item) => count + item.quantity, 0)
      },

      // Wishlist state
      wishlistItems: [],

      // Wishlist actions
      addToWishlist: (product: Product) => {
        set((state) => {
          const exists = state.wishlistItems.find((item) => item.product_id === product.product_id)
          if (exists) return state

          return {
            wishlistItems: [...state.wishlistItems, product],
          }
        })
      },

      removeFromWishlist: (productId: string) => {
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((item) => item.product_id !== productId),
        }))
      },

      isInWishlist: (productId: string) => {
        const { wishlistItems } = get()
        return wishlistItems.some((item) => item.product_id === productId)
      },

      moveToCart: (productId: string) => {
        const { wishlistItems, addToCart, removeFromWishlist } = get()
        const item = wishlistItems.find((item) => item.product_id === productId)
        if (item) {
          addToCart(item, 1)
          removeFromWishlist(productId)
        }
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
