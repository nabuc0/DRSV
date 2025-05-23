import { notFound } from "next/navigation";
import { Clock, Tag } from "lucide-react";
import {collectPostFiles, POSTS_DIR} from "@/lib/server-utils";
import { formatDate } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import FullWidthProductGallery from "@/components/full-width-product-gallery";
import Breadcrumb from "@/components/breadcrumb";
import fs from "fs/promises";
import type { Product } from "@/lib/types";
import Link from "next/link";
import React from "react";

export async function generateStaticParams() {
    const filePaths = await collectPostFiles(POSTS_DIR);
    const posts = await Promise.all(
        filePaths.map(async (filePath) => {
            const raw = await fs.readFile(filePath, "utf-8");
            return JSON.parse(raw) as { slug: string };
        })
    );
    return posts.map((post) => ({ slug: post.slug }));
}

interface PageProps {
    params: { slug: string };
}

export default async function PostPage({ params }: PageProps) {
    const slug = params.slug;

    // Load all posts
    const filePaths = await collectPostFiles(POSTS_DIR);
    const posts = await Promise.all(
        filePaths.map(async (filePath) => {
            const raw = await fs.readFile(filePath, "utf-8");
            return JSON.parse(raw) as {
                slug: string;
                category: string;
                categorySlug: string;
                title: string;
                excerpt: string;
                coverImage?: string;
                publishedAt: string;
                content: Array<
                    | { type: "text"; content: string }
                    | { type: "product"; product: Product }
                >;
            };
        })
    );

    // Find current post
    const post = posts.find((p) => p.slug === slug);
    if (!post) {
        notFound();
    }

    // Related posts in same category
    const relatedPosts = posts
        .filter((p) => p.category === post.category && p.slug !== slug)
        .sort(
            (a, b) =>
                new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        .slice(0, 3);

    const categoryName = post.category;

    // Render content sections
    const renderedContent: React.ReactElement[] = [];
    let currentProducts: Product[] = [];

    post.content.forEach((section, i) => {
        if (section.type === "text") {
            if (currentProducts.length) {
                renderedContent.push(
                    <div key={`gallery-${i}`} className="full-width-section">
                        <FullWidthProductGallery products={currentProducts} />
                    </div>
                );
                currentProducts = [];
            }
            renderedContent.push(
                <div
                    key={`text-${i}`}
                    className="my-6 text-justify"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                />
            );
        } else {
            currentProducts.push(section.product);
            const nextIsText =
                post.content[i + 1]?.type === "text" || i === post.content.length - 1;
            if (nextIsText) {
                renderedContent.push(
                    <div key={`gallery-${i}`} className="full-width-section">
                        <FullWidthProductGallery products={currentProducts} />
                    </div>
                );
                currentProducts = [];
            }
        }
    });

    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-6">
                <div className="max-w-4xl mx-auto mb-6">
                    <Breadcrumb
                        category={{ name: categoryName, slug: post.categorySlug }}
                        currentPage={post.title}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <article>
                    <div className="max-w-4xl mx-auto mb-8">
                        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <time dateTime={post.publishedAt}>
                                    {formatDate(post.publishedAt)}
                                </time>
                            </div>
                            {post.category && (
                                <div className="flex items-center gap-1">
                                    <Tag className="h-4 w-4" />
                                    <span>{categoryName}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {post.coverImage && (
                        <div className="max-w-5xl mx-auto mb-8">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-auto rounded-lg object-cover aspect-video"
                            />
                        </div>
                    )}

                    <div className="post-content">
                        {/* Excerpt */}
                        <div className="prose-section">
                            <p>{post.excerpt}</p>
                        </div>

                        {/* Main content */}
                        {renderedContent}

                        {/* Disclosure */}
                        <div className="prose-section">
                            <div className="mt-12 text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                                <p>
                                    <strong>Aviso:</strong> Como associado da Amazon, posso
                                    receber comissão por compras qualificadas. Este post contém
                                    links de afiliado, o que significa que posso receber uma
                                    comissão se você clicar e comprar algum produto recomendado.
                                </p>
                            </div>
                        </div>
                    </div>
                </article>

                {relatedPosts.length > 0 && (
                    <>
                        <Separator className="my-12" />
                        <section className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold mb-6">
                                Postagens relacionadas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((rp) => (
                                    <div
                                        key={rp.id}
                                        className="group relative flex flex-col overflow-hidden rounded-lg border bg-background"
                                    >
                                        <Link
                                            href={`/posts/${rp.slug}`}
                                            className="absolute inset-0 z-10"
                                        >
                                            <span className="sr-only">Ver {rp.title}</span>
                                        </Link>
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={
                                                    rp.coverImage ||
                                                    `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=200&width=400`
                                                }
                                                alt={rp.title}
                                                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex-1 p-4">
                                            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {rp.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {rp.excerpt}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
