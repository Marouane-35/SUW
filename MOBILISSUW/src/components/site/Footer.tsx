import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="container mx-auto max-w-7xl px-5 py-12 flex flex-col md:flex-row gap-8 justify-between">
        <div className="max-w-sm">
          <Logo size={32} />
          <p className="mt-4 text-sm text-muted-foreground">
            La navigation pensée pour les seniors et les personnes à mobilité réduite. Des trajets sûrs, accessibles, sereins.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div>
            <h4 className="font-semibold text-foreground mb-3">Produit</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/planner" className="hover:text-foreground">Planificateur</Link></li>
              <li><Link to="/" hash="features" className="hover:text-foreground">Fonctionnalités</Link></li>
              <li><Link to="/" hash="impact" className="hover:text-foreground">Impact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-3">Compte</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground">Se connecter</Link></li>
              <li><Link to="/trips" className="hover:text-foreground">Mes trajets</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Mobilis — Startup Week CS
      </div>
    </footer>
  );
}
