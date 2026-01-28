/**
 * Page des paramètres utilisateur
 * Gestion du compte, préférences, etc.
 */

import { useState } from "react";
import { User, Mail, Lock, Bell, Globe } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsPage() {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveProfile = () => {
    alert("Fonctionnalité à venir !");
  };

  const handleChangePassword = () => {
    alert("Fonctionnalité à venir !");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez votre compte et vos préférences
            </p>
          </div>

          {/* Profil */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Mon Profil
              </CardTitle>
              <CardDescription>Informations de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="bg-black/50 border-white/10"
                />
              </div>
              <Button onClick={handleSaveProfile}>
                Enregistrer les modifications
              </Button>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>Gérez votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/50 border-white/10"
                />
              </div>
              <Button onClick={handleChangePassword} variant="outline">
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>À venir prochainement</CardDescription>
            </CardHeader>
          </Card>

          {/* Préférences */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Préférences
              </CardTitle>
              <CardDescription>À venir prochainement</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
