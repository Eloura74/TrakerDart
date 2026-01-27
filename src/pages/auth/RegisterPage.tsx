import { useState } from "react";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth";

export function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await authService.signUp(
        formData.email,
        formData.password,
        formData.fullName,
      );
      if (error) throw error;

      // Redirection vers la connexion
      window.location.hash = "#/login";
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Inscription
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Rejoignez la communauté TrakerDart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  S'inscrire
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-400 mt-4">
              Déjà un compte ?{" "}
              <a
                href="#/login"
                className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              >
                Se connecter
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
