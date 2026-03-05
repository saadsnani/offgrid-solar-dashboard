"use client"

import { useState } from "react"
import { Sun, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnter = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsLoading(false)
    onLogin()
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/large-solar-panel-farm-installation-at-sunset-with.jpg')`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-energy-green rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl border border-white/10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 pulse-glow">
              <Sun className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Smart EMS</h1>
            <p className="text-muted-foreground text-sm mt-1">Système Intelligent de Gestion d'Énergie</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 space-y-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Projet de Fin d'Etudes</p>
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Encadre par :</span>{" "}
                  <span className="font-semibold">Mr. Abdelaziz FRI</span>
                </p>
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">Realise par :</span>{" "}
                  <span className="font-semibold">Saad SNANI & Walid EL HALOUAT</span>
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleEnter}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Entrer
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">Ecole Superieure de Technologie - EST</p>
            <p className="text-xs text-muted-foreground mt-2">© {new Date().getFullYear()} Smart EMS. Tous droits reserves.</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Toute reproduction, publication ou diffusion sans autorisation est interdite.
            </p>
            <p className="text-xs text-primary mt-2 font-semibold">By SAADSNANI</p>
          </div>
        </div>
      </div>
    </div>
  )
}
