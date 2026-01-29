/**
 * Composant Header réutilisable pour toutes les pages
 * Design moderne avec navigation et menu utilisateur
 */

import { useState, useEffect } from "react";
import {
  Target,
  Crown,
  Settings,
  LogOut,
  CreditCard,
  Sparkles,
  MessageSquare,
  Calendar,
  Menu,
} from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";

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
              <Target className="h-8 w-8 md:h-9 md:w-9 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent font-heading">
                TrakerDart
              </h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                Analyse biomécanique IA
              </p>
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Badge Tier (cliquable vers subscription) */}
            <div
              onClick={() => (window.location.hash = "#/subscription")}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <SubscriptionBadge tier={tier} size="sm" />
            </div>

            {/* Bouton Premium (seulement si pas Elite) - Visible sur mobile en version icône */}
            {tier !== "elite" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => (window.location.hash = "#/pricing")}
                className="group border-primary/30 hover:border-primary/60 hover:bg-primary/10 px-2 md:px-4"
              >
                <Crown className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform md:mr-2" />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-semibold hidden md:inline">
                  Premium
                </span>
              </Button>
            )}

            {/* Menu Utilisateur Desktop */}
            <div className="hidden md:block">
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
                      <p className="text-sm font-medium leading-none text-white font-heading">
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

                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Sparkles className="h-3 w-3" />
                      <span>Assistant IA</span>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuItem
                    onClick={() => (window.location.hash = "#/ai-chat")}
                    className="cursor-pointer hover:bg-white/5 text-white"
                  >
                    <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                    <span>Chat Coach IA</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => (window.location.hash = "#/ai-training")}
                    className="cursor-pointer hover:bg-white/5 text-white"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    <span>Plan d'Entraînement</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => (window.location.hash = "#/ai-settings")}
                    className="cursor-pointer hover:bg-white/5 text-white"
                  >
                    <Settings className="mr-2 h-4 w-4 text-primary" />
                    <span>Config IA</span>
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

            {/* Menu Mobile (Sheet) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="bg-black/95 border-white/10 w-[80%] pt-12"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu de navigation</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 px-2">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-cyan-500/20 text-primary font-bold text-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-heading font-medium text-white">
                          Mon Compte
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px]">
                          {userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/5"
                        onClick={() =>
                          (window.location.hash = "#/subscription")
                        }
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Mon Abonnement
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/5"
                        onClick={() => (window.location.hash = "#/settings")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Button>
                    </div>

                    <div className="space-y-1">
                      <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Assistant IA
                      </p>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/5"
                        onClick={() => (window.location.hash = "#/ai-chat")}
                      >
                        <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                        Chat Coach IA
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/5"
                        onClick={() => (window.location.hash = "#/ai-training")}
                      >
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        Plan d'Entraînement
                      </Button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
