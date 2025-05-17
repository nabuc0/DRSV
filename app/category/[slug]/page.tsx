import Link from "next/link"
import { Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import Breadcrumb from "@/components/breadcrumb"
import path from "path";
import fs from "fs/promises";
import categories from "../../../data/categories.json";

export async function generateStaticParams() {
    return categories.map((category: { slug: string }) => ({
        slug: category.slug,
    }));
}

interface PageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function CategoryPage({ params }: PageProps) {
  const postsDir = path.join(process.cwd(), 'data', 'blog');
  const filenames = await fs.readdir(postsDir);
  const posts = await Promise.all(
      filenames
          .filter((name) => name.endsWith(".json"))
          .map(async (name) => {
              const filePath = path.join(postsDir, name);
              const raw = await fs.readFile(filePath, "utf-8");
              return JSON.parse(raw);
          })
  );

  const slug = await params.slug
  const categoryPosts = posts.filter((post) => post.categorySlug === slug)

  if (categoryPosts.length === 0) {
    notFound()
  }

  // const categoryName = categories.find((category) => category.slug === slug)?.name || "Desconhecida"
  const categoryName = categoryPosts[0].category

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Breadcrumb currentPage={categoryName} />
      </div>

      <h1 className="text-4xl font-bold mb-8">{categoryName}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categoryPosts.map((post) => (
          <div
            key={post.id}
            className="group relative flex flex-col overflow-hidden rounded-lg border bg-background h-full"
          >
            <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-10">
              <span className="sr-only">Ver {post.title}</span>
            </Link>
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={post.coverImage || `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=200&width=400`}
                alt={post.title}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex-1 p-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </div>
              <h2 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
