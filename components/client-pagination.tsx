"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export default function ClientPagination({
    posts,
    postsPerPage,
}: {
    posts: any[]
    postsPerPage: number
}) {
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(posts.length / postsPerPage)

    // Get current posts
    const indexOfLastPost = currentPage * postsPerPage
    const indexOfFirstPost = indexOfLastPost - postsPerPage
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost)

    // Check for hash on initial load
    useEffect(() => {
        const hash = window.location.hash
        if (hash && hash.startsWith("#page=")) {
            const page = Number.parseInt(hash.replace("#page=", ""))
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                setCurrentPage(page)
            }
        }
    }, [totalPages])

    // Update hash when page changes
    useEffect(() => {
        window.location.hash = `page=${currentPage}`
    }, [currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo(0, 0)
    }

    // Generate page numbers to display
    const generatePagination = () => {
        const pages = []

        // Always add page 1
        pages.push(1)

        // Add ellipsis if there's a gap after page 1
        if (currentPage > 3) {
            pages.push("ellipsis-1")
        }

        // Add pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (i === 1 || i === totalPages) continue // Skip first and last page as they're always shown
            pages.push(i)
        }

        // Add ellipsis if there's a gap before the last page
        if (currentPage < totalPages - 2) {
            pages.push("ellipsis-2")
        }

        // Add last page if it's not page 1
        if (totalPages > 1) {
            pages.push(totalPages)
        }

        return pages
    }

    const pages = generatePagination()

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {currentPosts.map((post) => (
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

            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <Pagination>
                        <PaginationContent>
                            {currentPage > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`#page=${currentPage - 1}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage - 1)
                                        }}
                                    />
                                </PaginationItem>
                            )}

                            {pages.map((page, i) => {
                                if (typeof page === "string" && page.includes("ellipsis")) {
                                    return (
                                        <PaginationItem key={page}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )
                                }

                                return (
                                    <PaginationItem key={`page-${page}`}>
                                        <PaginationLink
                                            href={`#page=${page}`}
                                            isActive={currentPage === page}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                handlePageChange(page as number)
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}

                            {currentPage < totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        href={`#page=${currentPage + 1}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handlePageChange(currentPage + 1)
                                        }}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    )
}
