import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border">
      <div className="container mx-auto max-w-7xl flex items-center justify-between px-5 py-4">
        <Link to="/" className="hover:opacity-90 transition">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link to="/" hash="features" className="hover:text-foreground transition">Fonctionnalités</Link>
          <Link to="/" hash="impact" className="hover:text-foreground transition">Impact</Link>
          <Link to="/" hash="how" className="hover:text-foreground transition">Comment ça marche</Link>
          <Link to="/planner" className="hover:text-foreground transition">Planificateur</Link>
          <Link to="/community" className="hover:text-foreground transition">Communauté</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/trips"><Button variant="ghost" size="sm">Mes trajets</Button></Link>
              <Button size="sm" variant="outline" onClick={() => supabase.auth.signOut()}>Déconnexion</Button>
            </>
          ) : (
            <>
              <Link to="/auth"><Button variant="ghost" size="sm">Se connecter</Button></Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 font-semibold rounded-full px-5">
                  S'inscrire →
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
