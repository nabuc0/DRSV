import Link from "next/link"
import {ChevronRight, Home} from "lucide-react"
import {BreadcrumbProps} from "@/components/client-pagination";

export default function Breadcrumb({ category, currentPage }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">
                Início
            </span>
          </Link>
        </li>
        <li>
          <ChevronRight className="h-4 w-4" />
        </li>
        {category ? (
          <>
            <li>
              <Link href={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                {category.name}
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4" />
            </li>
          </>
        ) : (
          <li>
            <Link href="/posts" className="hover:text-primary transition-colors">
              Postagens
            </Link>
          </li>
        )}
        <li className="font-medium text-foreground max-w-[200px] truncate">{currentPage}</li>
      </ol>
    </nav>
  )
}
