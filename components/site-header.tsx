import Link from "next/link"
import slugify from "slugify";
// import { Search } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import categories from "../data/categories.json"

export default function SiteHeader() {
  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold tracking-tight">DRSV</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/posts" className="text-sm font-medium transition-colors hover:text-primary">
                Todas as postagens
              </Link>
              {categories
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 4)
                  .map(({ name, slug }) => (
                <Link
                  key={name}
                  href={`/category/${slug}`}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {name}
                </Link>
              ))}
            </nav>
          </div>
          {/*<div className="hidden md:flex items-center gap-4">*/}
          {/*  <form className="relative">*/}
          {/*    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />*/}
          {/*    <Input*/}
          {/*        type="search"*/}
          {/*        placeholder="Search..."*/}
          {/*        className="w-64 pl-9"*/}
          {/*    />*/}
          {/*  </form>*/}
          {/*</div>*/}
          {/*<Button variant="outline" size="icon" className="md:hidden">*/}
          {/*  <Search className="h-4 w-4" />*/}
          {/*  <span className="sr-only">Search</span>*/}
          {/*</Button>*/}
        </div>
      </header>
  )
}
