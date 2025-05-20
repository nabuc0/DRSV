import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

interface FullWidthProductGalleryProps {
  products: Product[]
}

export default function FullWidthProductGallery({ products }: FullWidthProductGalleryProps) {
  return (
    <div className="py-8 w-full bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row border rounded-lg overflow-hidden bg-background hover:bg-muted/10 transition-colors"
            >
              <div className="relative w-full sm:w-48 h-48">
                <Image
                  src={product.image || `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=200&width=200`}
                  alt={product.title}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h4 className="font-medium text-lg mb-2">{product.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <div className="mt-auto flex flex-col sm:flex-row sm:items-center gap-3">
                    {product.price > 0 && (
                        <div className="font-bold text-lg">R${product.price.toFixed(2)}</div>
                    )}
                  <Button asChild className="sm:ml-auto">
                    <a
                      href={product.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      Ver no Amazon <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
