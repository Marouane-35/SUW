import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: (s.mode === "signup" ? "signup" : "login") as "signup" | "login",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Connexion — Mobilis" }, { name: "description", content: "Connectez-vous ou créez votre compte Mobilis pour personnaliser votre profil mobilité et sauvegarder vos trajets." }] }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "6 caractères minimum").max(72),
  full_name: z.string().trim().max(100).optional(),
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { setIsSignup(mode === "signup"); }, [mode]);
  useEffect(() => {
    if (user) navigate({ to: redirect ?? "/planner" });
  }, [user, navigate, redirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password, full_name: fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/planner`,
            data: { full_name: parsed.data.full_name ?? "" },
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Bienvenue sur Mobilis.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
        if (error) throw error;
        toast.success("Bon retour !");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-md px-5 py-16">
        <div className="bg-card border border-border rounded-3xl p-8" style={{ boxShadow: "var(--shadow-glow)" }}>
          <h1 className="text-3xl font-bold">{isSignup ? "Créer un compte" : "Se connecter"}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isSignup ? "Personnalisez votre profil et sauvegardez vos trajets." : "Heureux de vous revoir."}
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Marie Dupont" className="mt-1.5 bg-surface" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" className="mt-1.5 bg-surface" />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-surface" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold h-11 rounded-full">
              {loading && <Loader2 className="size-4 mr-2 animate-spin" />}
              {isSignup ? "Créer mon compte" : "Se connecter"}
            </Button>
          </form>
          <button onClick={() => setIsSignup((v) => !v)} className="mt-5 text-sm text-muted-foreground hover:text-foreground w-full text-center">
            {isSignup ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
