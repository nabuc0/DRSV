"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, Coffee, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-2 border-dashed border-muted-foreground/20">
            <CardContent className="p-8 md:p-12">
              {/* 404 Number with animation */}
              <div className="mb-8">
                <h1 className="text-8xl md:text-9xl font-bold text-primary/20 select-none">404</h1>
              </div>

              {/* Coffee emoji with subtle animation */}
              <div className="mb-6">
                <div className="text-6xl animate-bounce">☕</div>
              </div>

              {/* Main heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ops! Página não encontrada</h2>

              {/* Fun Brazilian message */}
              <p className="text-lg text-muted-foreground mb-2">
                Parece que esta página foi fazer um cafezinho e não voltou...
              </p>

              <p className="text-muted-foreground mb-8">Ou talvez você digitou o endereço errado? 🤔</p>

              {/* Helpful suggestions */}
              <div className="bg-muted/50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-foreground mb-3">O que você pode fazer:</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Verificar se o endereço está correto
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Voltar para a página inicial
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Procurar pelo que você estava buscando
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Tomar um café enquanto pensa no que fazer 😄
                  </li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    Voltar ao Início
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/posts">
                    <Search className="w-4 h-4" />
                    Ver Todos os Posts
                  </Link>
                </Button>
              </div>

              {/* Fun footer message */}
              <div className="mt-8 pt-6 border-t border-muted-foreground/20">
                <p className="text-sm text-muted-foreground">
                  <Coffee className="w-4 h-4 inline mr-1" />
                  Enquanto isso, que tal dar uma olhada nos nossos posts mais recentes?
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à página anterior
            </Button>
          </div>
        </div>
      </div>
  )
}
