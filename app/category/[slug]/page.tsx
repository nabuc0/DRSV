import { notFound } from "next/navigation";
import Breadcrumb from "@/components/breadcrumb";
import ClientPagination from "@/components/client-pagination";
import fs from "fs/promises";
import categories from "../../../data/categories.json";
import {collectPostFiles, POSTS_DIR} from "@/lib/server-utils";

export async function generateStaticParams() {
    return categories.map((category) => ({
        slug: category.slug,
    }));
}

interface PageProps {
    params: { slug: string };
}

export default async function CategoryPage({ params }: PageProps) {
    const filePaths = await collectPostFiles(POSTS_DIR);

    // Load and parse every post
    const posts = await Promise.all(
        filePaths.map(async (filePath) => {
            const raw = await fs.readFile(filePath, "utf-8");
            return JSON.parse(raw) as {
                categorySlug: string;
                category: string;
                // ...other post fields
            };
        })
    );

    const slug = params.slug;
    const categoryPosts = posts.filter((post) => post.categorySlug === slug);

    if (categoryPosts.length === 0) {
        notFound();
    }

    const categoryName = categoryPosts[0].category;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <Breadcrumb currentPage={categoryName} />
            </div>

            <h1 className="text-4xl font-bold mb-8">{categoryName}</h1>

            <ClientPagination posts={categoryPosts} postsPerPage={12} />
        </div>
    );
}
