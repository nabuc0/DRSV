import Breadcrumb from "@/components/breadcrumb";
import fs from "fs/promises";
import ClientPagination from "@/components/client-pagination";
import {collectPostFiles, POSTS_DIR} from "@/lib/server-utils";

export async function generateStaticParams() {
    const files = await collectPostFiles(POSTS_DIR);

    const posts = await Promise.all(
        files.map(async (filePath) => {
            const raw = await fs.readFile(filePath, "utf-8");
            return JSON.parse(raw) as { slug: string };
        })
    );

    return posts.map((post) => ({ slug: post.slug }));
}

export default async function PostsPage() {
    const files = await collectPostFiles(POSTS_DIR);

    const posts = await Promise.all(
        files.map(async (filePath) => {
            const raw = await fs.readFile(filePath, "utf-8");
            return JSON.parse(raw) as { publishedAt: string; slug: string /* …other props*/ };
        })
    );

    // sort by publishedAt descending
    posts.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <Breadcrumb currentPage="Todas as postagens" />
            </div>

            <h1 className="text-4xl font-bold mb-8">Todas as postagens</h1>

            <ClientPagination posts={posts} postsPerPage={12} />
        </div>
    );
}
