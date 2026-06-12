import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, MapPin, Trash2, ArrowRight } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/mobilis";
import { toast } from "sonner";

export const Route = createFileRoute("/trips")({
  head: () => ({ meta: [{ title: "Mes trajets — Mobilis" }] }),
  component: TripsPage,
  ssr: false,
});

interface Trip {
  id: string;
  origin_label: string;
  destination_label: string;
  distance_m: number;
  duration_s: number;
  created_at: string;
}

interface Profile {
  full_name: string | null;
  mobility_profile: string | null;
  avoid_stairs: boolean;
  avoid_steep: boolean;
  prefer_rest_stops: boolean;
}

function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { mode: "login", redirect: "/trips" } });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from("trips").select("id,origin_label,destination_label,distance_m,duration_s,created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name,mobility_profile,avoid_stairs,avoid_steep,prefer_rest_stops").eq("id", user.id).maybeSingle(),
      ]);
      setTrips((t ?? []) as Trip[]);
      setProfile(p as Profile | null);
      setLoading(false);
    })();
  }, [user]);

  async function deleteTrip(id: string) {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setTrips((t) => t.filter((x) => x.id !== id));
    toast.success("Trajet supprimé");
  }

  async function saveProfile(p: Partial<Profile>) {
    if (!user) return;
    const next = { ...(profile ?? { full_name: "", mobility_profile: "none", avoid_stairs: true, avoid_steep: true, prefer_rest_stops: false }), ...p };
    setProfile(next as Profile);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, ...next });
    if (error) toast.error(error.message);
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Mon espace Mobilis</h1>
        <p className="text-muted-foreground mt-1.5">Gérez votre profil mobilité et retrouvez vos trajets sauvegardés.</p>

        <div className="mt-8 grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Profile */}
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold">Profil mobilité</h2>
            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="fn">Nom</Label>
                <Input id="fn" value={profile?.full_name ?? ""} onChange={(e) => setProfile((p) => ({ ...(p ?? {} as Profile), full_name: e.target.value }))} onBlur={(e) => saveProfile({ full_name: e.target.value })} className="mt-1.5 bg-surface" />
              </div>
              <div>
                <Label htmlFor="mp">Type de mobilité</Label>
                <select id="mp" value={profile?.mobility_profile ?? "none"} onChange={(e) => saveProfile({ mobility_profile: e.target.value })} className="mt-1.5 w-full bg-surface border border-border rounded-md h-10 px-3 text-sm">
                  <option value="none">Aucun particulier</option>
                  <option value="wheelchair">Fauteuil roulant</option>
                  <option value="walker">Déambulateur</option>
                  <option value="cane">Canne</option>
                  <option value="senior">Senior</option>
                  <option value="visual">Déficience visuelle</option>
                </select>
              </div>
              <Toggle label="Éviter les escaliers" v={profile?.avoid_stairs ?? true} on={(v) => saveProfile({ avoid_stairs: v })} />
              <Toggle label="Éviter les pentes raides" v={profile?.avoid_steep ?? true} on={(v) => saveProfile({ avoid_steep: v })} />
              <Toggle label="Privilégier les points de repos" v={profile?.prefer_rest_stops ?? false} on={(v) => saveProfile({ prefer_rest_stops: v })} />
            </div>
          </div>

          {/* Trips */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Trajets sauvegardés ({trips.length})</h2>
              <Link to="/planner"><Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90 rounded-full">Nouveau trajet <ArrowRight className="size-4 ml-1" /></Button></Link>
            </div>
            {loading ? (
              <div className="bg-card border border-border rounded-2xl p-10 flex justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
            ) : trips.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
                Aucun trajet sauvegardé pour l'instant.
              </div>
            ) : (
              <ul className="space-y-3">
                {trips.map((t) => (
                  <li key={t.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{t.origin_label}</span>
                        <ArrowRight className="size-3.5 shrink-0" />
                        <span className="truncate">{t.destination_label}</span>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs">
                        <span className="font-semibold text-primary">{formatDistance(t.distance_m)}</span>
                        <span className="font-semibold text-primary">{formatDuration(t.duration_s)}</span>
                        <span className="text-muted-foreground">{new Date(t.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteTrip(t.id)} aria-label="Supprimer">
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}
