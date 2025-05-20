import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface ProductProps {
  product: {
    title: string
    description: string
    price: number
    image: string
    affiliateLink: string
  }
}

export default function ProductCard({ product }: ProductProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="relative aspect-square">
          <Image
            src={product.image || `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=300&width=300`}
            alt={product.title}
            fill
            className="object-contain"
          />
        </div>
        <CardContent className="pt-6 flex-grow md:col-span-2 p-4">
          <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
          <p className="text-muted-foreground mb-4">{product.description}</p>
          <div className="flex items-end gap-2 mb-4">
            {product.price > 0 && (
                <span className="text-lg font-bold">R${product.price.toFixed(2)}</span>
            )}
          </div>
          <CardFooter className="p-0">
            <Button asChild className="w-full md:w-auto">
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1"
              >
                View on Amazon <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </CardFooter>
        </CardContent>
      </div>
    </Card>
  )
}
