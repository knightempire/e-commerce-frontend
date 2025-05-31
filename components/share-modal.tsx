"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, Check, MessageCircle, Mail, Twitter, Facebook, Linkedin, Instagram, X } from "lucide-react"

interface ShareModalProps {
  url: string
  title: string
  description?: string
  price?: string
  image?: string
  children?: React.ReactNode
}

export function ShareModal({ url, title, description, price, image, children }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyText, setCopyText] = useState("Copy")

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const shareText = `${title}${price ? ` - ${price}` : ""}`
  const encodedText = encodeURIComponent(shareText)

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600 text-white",
      url: `https://wa.me/?text=${encodedText}%0A${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-blue-400 hover:bg-blue-500 text-white",
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800 text-white",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700 text-white",
      url: `mailto:?subject=${encodedTitle}&body=Check out this product: ${shareText}%0A%0A${encodedUrl}`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "bg-pink-500 hover:bg-pink-600 text-white",
      url: `https://www.instagram.com/`,
      note: "Copy link to share on Instagram",
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setCopyText("Copied!")
      setTimeout(() => {
        setCopied(false)
        setCopyText("Copy")
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = url
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        setCopyText("Copied!")
        setTimeout(() => {
          setCopied(false)
          setCopyText("Copy")
        }, 2000)
      } catch (copyErr) {
        console.error("Fallback copy failed:", copyErr)
        setCopyText("Failed")
        setTimeout(() => setCopyText("Copy"), 2000)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleShare = (option: any) => {
    if (option.note) {
      copyToClipboard()
    } else {
      // Open in new tab
      const newWindow = window.open(option.url, "_blank", "width=600,height=400,scrollbars=yes,resizable=yes")
      if (newWindow) {
        newWindow.focus()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Product
          </DialogTitle>
          <DialogDescription>Share this amazing product with your friends and family</DialogDescription>
        </DialogHeader>

        {/* Product Preview */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {image && (
                <div className="w-16 h-16 relative rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=64&width=64"
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm line-clamp-2">{title}</h4>
                {description && <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>}
                {price && (
                  <Badge variant="secondary" className="mt-1">
                    {price}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Copy Link Section */}
        <div className="space-y-2">
          <Label htmlFor="link">Product Link</Label>
          <div className="flex gap-2">
            <Input
              id="link"
              value={url}
              readOnly
              className="flex-1 text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="flex-shrink-0 min-w-[80px]"
              disabled={copied}
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copyText}
            </Button>
          </div>
          {copied && <p className="text-sm text-green-600 font-medium">✓ Link copied to clipboard!</p>}
        </div>

        {/* Social Share Options */}
        <div className="space-y-3">
          <Label>Share on Social Media</Label>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className={`flex flex-col items-center gap-2 h-auto py-3 border-0 transition-all hover:scale-105 ${option.color}`}
                onClick={() => handleShare(option)}
              >
                <option.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{option.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
