import { notFound } from "next/navigation"
import Breadcrumb from "@/components/breadcrumb"
import path from "path"
import fs from "fs/promises"
import categories from "../../../data/categories.json"
import ClientPagination from "@/components/client-pagination"

export async function generateStaticParams() {
    return categories.map((category: { slug: string }) => ({
        slug: category.slug,
    }))
}

interface PageProps {
    params: { slug: string }
    searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function CategoryPage({ params }: PageProps) {
    const postsDir = path.join(process.cwd(), "data", "blog")
    const filenames = await fs.readdir(postsDir)
    const posts = await Promise.all(
        filenames
            .filter((name) => name.endsWith(".json"))
            .map(async (name) => {
                const filePath = path.join(postsDir, name)
                const raw = await fs.readFile(filePath, "utf-8")
                return JSON.parse(raw)
            }),
    )

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

            <ClientPagination posts={categoryPosts} postsPerPage={12} />
        </div>
    )
}
