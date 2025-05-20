import Breadcrumb from "@/components/breadcrumb"
import fs from "fs/promises"
import path from "path"
import ClientPagination from "@/components/client-pagination"

export async function generateStaticParams() {
    const postsDir = path.join(process.cwd(), "data", "blog")
    const filenames = await fs.readdir(postsDir)
    const posts = await Promise.all(
        filenames
            .filter((name: string) => name.endsWith(".json"))
            .map(async (name: string) => {
                const filePath = path.join(postsDir, name)
                const raw = await fs.readFile(filePath, "utf-8")
                return JSON.parse(raw)
            }),
    )

    return posts.map((post: any) => ({ slug: post.slug }))
}

export default async function PostsPage() {
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

    // sort by publishedAt descending
    posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <Breadcrumb currentPage="Todas as postagens" />
            </div>

            <h1 className="text-4xl font-bold mb-8">Todas as postagens</h1>

            <ClientPagination posts={posts} postsPerPage={12} />
        </div>
    )
}
