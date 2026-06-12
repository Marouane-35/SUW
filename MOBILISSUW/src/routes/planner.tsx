import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { PlaceSearch } from "@/components/site/PlaceSearch";
import { AuditReport } from "@/components/site/AuditReport";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Navigation, Save, MapPinned } from "lucide-react";
import { computeRoute, type GeoPoint, type RouteResult } from "@/lib/mobilis";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const MapView = lazy(() => import("@/components/site/MapView"));

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Planificateur — Mobilis" }, { name: "description", content: "Planifiez un trajet accessible en quelques clics : recherchez une destination, choisissez vos contraintes et obtenez un rapport d'audit." }] }),
  component: Planner,
  ssr: false,
});

function Planner() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState<GeoPoint | null>(null);
  const [destination, setDestination] = useState<GeoPoint | null>(null);
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [avoidSteep, setAvoidSteep] = useState(true);
  const [preferRest, setPreferRest] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Try geolocation as default origin
  useEffect(() => {
    if (origin || typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Ma position" }),
      () => {},
      { timeout: 5000 },
    );
  }, [origin]);

  async function plan() {
    if (!origin || !destination) {
      toast.error("Indiquez un départ et une arrivée");
      return;
    }
    setLoading(true);
    try {
      const r = await computeRoute(origin, destination, {
        avoid_stairs: avoidStairs,
        avoid_steep: avoidSteep,
        prefer_rest_stops: preferRest,
      });
      setRoute(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de calcul");
    } finally {
      setLoading(false);
    }
  }

  async function saveTrip() {
    if (!user) {
      toast.info("Connectez-vous pour sauvegarder ce trajet");
      return;
    }
    if (!origin || !destination || !route) return;
    const { error } = await supabase.from("trips").insert({
      user_id: user.id,
      origin_label: origin.label,
      destination_label: destination.label,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      dest_lat: destination.lat,
      dest_lng: destination.lng,
      distance_m: route.distance_m,
      duration_s: route.duration_s,
      geometry: route.geometry,
      constraints: route.constraints,
    });
    if (error) toast.error(error.message);
    else toast.success("Trajet sauvegardé !");
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">Planificateur de trajet accessible</h1>
          <p className="text-muted-foreground mt-1.5">Indiquez vos points, choisissez vos contraintes, obtenez un rapport d'audit.</p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Sidebar */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-5 h-fit">
            <PlaceSearch label="Départ" value={origin} onChange={setOrigin} placeholder="Ma position ou une adresse" />
            <PlaceSearch label="Arrivée" value={destination} onChange={setDestination} placeholder="Où allez-vous ?" />

            <div className="border-t border-border pt-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">Contraintes accessibilité</div>
              <ToggleRow label="Éviter les escaliers" checked={avoidStairs} onChange={setAvoidStairs} />
              <ToggleRow label="Éviter les pentes raides" checked={avoidSteep} onChange={setAvoidSteep} />
              <ToggleRow label="Privilégier les points de repos" checked={preferRest} onChange={setPreferRest} />
            </div>

            <Button onClick={plan} disabled={loading || !origin || !destination} className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold h-11 rounded-full">
              {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Navigation className="size-4 mr-2" />}
              Calculer l'itinéraire
            </Button>

            {route && (
              <Button onClick={saveTrip} variant="outline" className="w-full rounded-full">
                <Save className="size-4 mr-2" /> Sauvegarder ce trajet
              </Button>
            )}
            {!user && route && (
              <p className="text-xs text-muted-foreground text-center">
                <Link to="/auth" className="underline">Créez un compte</Link> pour sauvegarder et personnaliser vos trajets.
              </p>
            )}
          </div>

          {/* Map + audit */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <Suspense fallback={<div className="h-[480px] flex items-center justify-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>}>
                <MapView
                  origin={origin ?? undefined}
                  destination={destination ?? undefined}
                  route={route?.geometry}
                  className="h-[480px] w-full"
                />
              </Suspense>
            </div>

            {route && origin && destination ? (
              <AuditReport origin={origin} destination={destination} route={route} />
            ) : (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <MapPinned className="size-10 mx-auto text-muted-foreground" />
                <p className="mt-3 text-muted-foreground">Calculez un itinéraire pour générer le rapport d'audit.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm font-normal cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
