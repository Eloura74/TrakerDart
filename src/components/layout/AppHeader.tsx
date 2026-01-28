/**
 * Composant Header réutilisable pour toutes les pages
 * Design moderne avec navigation et menu utilisateur
 */

import { useState, useEffect } from "react";
import { Target, Crown, Settings, LogOut, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { getUserTier } from "@/services/subscription";
import { supabase } from "@/lib/supabase";
import type { SubscriptionTier } from "@/types/subscription";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppHeaderProps {
  showActions?: boolean;
  onNewSession?: () => void;
}

export function AppHeader({
  showActions: _showActions = true,
  onNewSession: _onNewSession,
}: AppHeaderProps) {
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    // Charger tier et email utilisateur
    getUserTier().then(setTier);
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = "#/login";
  };

  // Initiales pour l'avatar
  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "U";

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Titre */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => (window.location.hash = "#/")}
          >
            <div className="relative">
              <Target className="h-9 w-9 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                TrakerDart
              </h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                Analyse biomécanique IA
              </p>
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center gap-3">
            {/* Badge Tier (cliquable vers subscription) */}
            <div
              onClick={() => (window.location.hash = "#/subscription")}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <SubscriptionBadge tier={tier} size="sm" />
            </div>

            {/* Bouton Premium (seulement si pas Elite) */}
            {tier !== "elite" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.hash = "#/pricing")}
                className="hidden md:flex group border-primary/30 hover:border-primary/60 hover:bg-primary/10"
              >
                <Crown className="h-4 w-4 mr-2 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-semibold">
                  Premium
                </span>
              </Button>
            )}

            {/* Menu Utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-cyan-500/20 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-black/95 backdrop-blur-xl border-white/10"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      Mon Compte
                    </p>
                    <p className="text-xs leading-none text-gray-400 truncate">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#/subscription")}
                  className="cursor-pointer hover:bg-white/5 text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Mon Abonnement</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#/settings")}
                  className="cursor-pointer hover:bg-white/5 text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-red-500/10 text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
