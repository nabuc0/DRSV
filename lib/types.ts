export interface Product {
  category: string;
  title: string
  description: string
  price: number
  image: string
  affiliateLink: string
}

export interface ContentSection {
  type: "text" | "product"
  content?: string
  product?: Product
}

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  coverImage: string
  publishedAt: string
  content: ContentSection[]
}
