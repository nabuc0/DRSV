"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Product {
  title: string
  description: string
  price: number
  image: string
  affiliateLink: string
}

interface ProductEmbedderProps {
  product: Product
  onChange: (product: Product) => void
}

export default function ProductEmbedder({ product, onChange }: ProductEmbedderProps) {
  function handleChange(field: keyof Product, value: string | number) {
    onChange({
      ...product,
      [field]: value,
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="product-title">Product Title</Label>
        <Input
          id="product-title"
          value={product.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Product Title"
        />
      </div>

      <div>
        <Label htmlFor="product-description">Product Description</Label>
        <Textarea
          id="product-description"
          value={product.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Product Description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="product-price">Price ($)</Label>
          <Input
            id="product-price"
            type="number"
            step="0.01"
            value={product.price}
            onChange={(e) => handleChange("price", Number.parseFloat(e.target.value))}
            placeholder="29.99"
          />
        </div>

        <div>
          <Label htmlFor="product-image">Product Image URL</Label>
          <Input
            id="product-image"
            value={product.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="product-link">Amazon Affiliate Link</Label>
        <Input
          id="product-link"
          value={product.affiliateLink}
          onChange={(e) => handleChange("affiliateLink", e.target.value)}
          placeholder="https://amazon.com/dp/B0123456?tag=yourtag-20"
        />
      </div>
    </div>
  )
}
