import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";
import categories from "../data/categories.json";

export default async function Home() {
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

  // 2) sort by publishedAt descending
  posts.sort(
      (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
      <div className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Ofertas Diárias da Amazon
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra os melhores produtos na Amazon, escolhidos especialmente para você.
            </p>
          </div>

          {/* Featured posts - larger format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {posts.slice(0, 2).map((post) => (
                <div
                    key={post.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border bg-background h-full"
                >
                  <Link href={`/posts/${post.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">Ver {post.title}</span>
                  </Link>
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                        src={post.coverImage || `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=400&width=800`}
                        alt={post.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                    <h2 className="font-semibold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
            ))}
          </div>

          {/* Regular posts - grid layout with rectangular images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.slice(2, 22).map((post) => (
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
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                    <h2 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </div>
                </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
                href="/posts"
                className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Ver todas as postagens <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mb-12 bg-muted p-8 rounded-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Por que comprar pelos nossos links?</h2>
            <p className="text-lg mb-6">
              Pesquisamos e testamos produtos para trazer sempre as melhores recomendações. Comprando pelos nossos links, você apoia nosso site sem pagar nada a mais por isso.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Avaliações confiáveis</h3>
                <p>Só indicamos produtos em que realmente acreditamos</p>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Novidades todos os dias</h3>
                <p>Tem dica nova de produto todos os dias</p>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Preço igual</h3>
                <p>Você nunca paga a mais comprando pelos nossos links</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Navegue por categoria</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre recomendações de produtos por categoria
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Get 4 random categories from categories.json */}
            {categories
              .sort(() => 0.5 - Math.random())
              .slice(0, 4)
              .map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="group relative flex items-center justify-center rounded-lg overflow-hidden h-32 border"
                >
                  <img
                    src={category.image || `${process.env.NEXT_PUBLIC_BASE_PATH}/placeholder.svg?height=200&width=400`}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/40 group-hover:from-black/80 group-hover:via-black/60 transition-colors" />
                  <span className="relative text-lg font-semibold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]">{category.name}</span>
                </Link>
              ))}
          </div>
        </section>
      </div>
  );
}
