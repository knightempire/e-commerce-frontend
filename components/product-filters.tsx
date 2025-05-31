"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { SearchParams } from "@/lib/api"
import { productAPI } from "@/lib/api"
import { Filter, X, Star, Loader2 } from "lucide-react"

interface ProductFiltersProps {
  onFiltersChange: (filters: SearchParams) => void
  loading?: boolean
}

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price_low_to_high", label: "Price: Low to High" },
  { value: "price_high_to_low", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
]

export function ProductFilters({ onFiltersChange, loading }: ProductFiltersProps) {
  const [filters, setFilters] = useState<SearchParams>({})
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [priceRangeFromAPI, setPriceRangeFromAPI] = useState<[number, number]>([0, 1000])

  // Fetch dynamic brands and price range from API
  useEffect(() => {
    const fetchFilterData = async () => {
      setBrandsLoading(true)
      try {
        // Fetch products to get available brands and price range
        const response = await productAPI.searchProducts({
          q: "electronics headphones speakers",
          num: 100, // Get more products to analyze
        })

        if (response.products) {
          // Extract unique brands
          const brands = new Set<string>()
          let minPrice = Number.POSITIVE_INFINITY
          let maxPrice = 0

          response.products.forEach((product) => {
            // Add brand if it exists
            if (product.brand) {
              brands.add(product.brand)
            }
            if (product.source) {
              brands.add(product.source)
            }

            // Track price range
            if (product.extracted_price > 0) {
              minPrice = Math.min(minPrice, product.extracted_price)
              maxPrice = Math.max(maxPrice, product.extracted_price)
            }
          })

          const brandArray = Array.from(brands).filter(Boolean).sort()
          setAvailableBrands(brandArray)

          // Set dynamic price range
          if (minPrice !== Number.POSITIVE_INFINITY && maxPrice > 0) {
            const roundedMin = Math.floor(minPrice / 10) * 10
            const roundedMax = Math.ceil(maxPrice / 10) * 10
            setPriceRangeFromAPI([roundedMin, roundedMax])
            setPriceRange([roundedMin, roundedMax])
          }
        }
      } catch (error) {
        console.error("Error fetching filter data:", error)
        // Fallback to static brands if API fails
        setAvailableBrands([
          "AudioTech",
          "SoundMax",
          "BassBoost",
          "GameSound",
          "ProAudio",
          "TinySound",
          "Apple",
          "Samsung",
          "Sony",
          "Bose",
          "JBL",
          "Beats",
          "Sennheiser",
          "Audio-Technica",
        ])
      } finally {
        setBrandsLoading(false)
      }
    }

    fetchFilterData()
  }, [])

  const updateFilters = (newFilters: Partial<SearchParams>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand]

    setSelectedBrands(newBrands)
    updateFilters({ brand: newBrands.length > 0 ? newBrands.join(",") : undefined })
  }

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
    updateFilters({
      min_price: value[0] > priceRangeFromAPI[0] ? value[0] : undefined,
      max_price: value[1] < priceRangeFromAPI[1] ? value[1] : undefined,
    })
  }

  const handleRatingChange = (rating: number) => {
    const newRating = minRating === rating ? 0 : rating
    setMinRating(newRating)
    updateFilters({ rating: newRating > 0 ? newRating : undefined })
  }

  const clearFilters = () => {
    setFilters({})
    setPriceRange(priceRangeFromAPI)
    setSelectedBrands([])
    setMinRating(0)
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || selectedBrands.length > 0 || minRating > 0

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort By */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={filters.sort_by || "relevance"}
            onValueChange={(value) => updateFilters({ sort_by: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={priceRangeFromAPI[1]}
              min={priceRangeFromAPI[0]}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <Label>Minimum Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={minRating >= rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleRatingChange(rating)}
                className="p-2"
              >
                <Star className={`h-4 w-4 ${minRating >= rating ? "fill-current" : ""}`} />
              </Button>
            ))}
          </div>
          {minRating > 0 && <p className="text-sm text-muted-foreground">{minRating}+ stars</p>}
        </div>

        {/* Brand Filter */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Brands
            {brandsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </Label>

          {brandsLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <Label htmlFor={brand} className="text-sm font-normal cursor-pointer">
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {selectedBrands.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedBrands.map((brand) => (
                <Badge key={brand} variant="secondary" className="text-xs">
                  {brand}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleBrandToggle(brand)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Apply Filters Button */}
        <Button className="w-full" disabled={loading} onClick={() => onFiltersChange(filters)}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply Filters"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
