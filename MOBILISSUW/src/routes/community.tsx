import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { searchPlace, type GeoPoint } from "@/lib/mobilis";
import { toast } from "sonner";
import { AlertTriangle, Star, MessageSquare, MapPin, Radio, Clock } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Communauté Mobilis — Avis & alertes accessibilité en temps réel" },
      { name: "description", content: "Partagez vos retours sur l'accessibilité des lieux et recevez en temps réel les alertes (travaux, ascenseurs en panne, obstacles) signalées par la communauté Mobilis." },
    ],
  }),
  component: CommunityPage,
});

type Review = {
  id: string;
  user_id: string;
  place_label: string;
  lat: number;
  lng: number;
  rating: number;
  comment: string | null;
  tags: string[] | null;
  created_at: string;
};

type Alert = {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  description: string;
  lat: number;
  lng: number;
  location_label: string | null;
  expires_at: string;
  created_at: string;
};

const ALERT_TYPES = [
  { v: "elevator_down", l: "Ascenseur en panne" },
  { v: "construction", l: "Travaux / chantier" },
  { v: "obstacle", l: "Obstacle sur le trottoir" },
  { v: "crowded", l: "Lieu très fréquenté" },
  { v: "broken_pavement", l: "Trottoir endommagé" },
  { v: "other", l: "Autre" },
];

const SEVERITIES = [
  { v: "info", l: "Info", c: "bg-primary/15 text-primary border-primary/30" },
  { v: "warning", l: "Attention", c: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30" },
  { v: "critical", l: "Critique", c: "bg-red-500/15 text-red-300 border-red-500/30" },
];

function CommunityPage() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-5 py-12">
        <header className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Communauté</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold">Avis & alertes en temps réel.</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Partagez l'accessibilité réelle des lieux et signalez les incidents (ascenseur en panne, travaux, obstacles) pour aider toute la communauté Mobilis.
          </p>
        </header>

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <AlertsPanel />
          <ReviewsPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AlertsPanel() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [form, setForm] = useState({ alert_type: "elevator_down", severity: "warning", description: "", place: null as GeoPoint | null });
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoPoint[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("alerts").select("*").gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => data && setAlerts(data as Alert[]));
    const ch = supabase.channel("alerts-live").on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, (payload) => {
      if (payload.eventType === "INSERT") {
        setAlerts((prev) => [payload.new as Alert, ...prev]);
        toast.info("🔔 Nouvelle alerte signalée", { description: (payload.new as Alert).description });
      } else if (payload.eventType === "DELETE") {
        setAlerts((prev) => prev.filter((a) => a.id !== (payload.old as Alert).id));
      }
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (q.length < 3) { setResults([]); return; }
    const t = setTimeout(() => { searchPlace(q).then(setResults); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Connectez-vous pour signaler une alerte"); return; }
    if (!form.place || !form.description.trim()) { toast.error("Lieu et description requis"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      alert_type: form.alert_type,
      severity: form.severity,
      description: form.description.trim().slice(0, 500),
      lat: form.place.lat,
      lng: form.place.lng,
      location_label: form.place.label,
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Alerte publiée");
      setForm({ alert_type: "elevator_down", severity: "warning", description: "", place: null });
      setQ("");
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("alerts").delete().eq("id", id);
    if (error) toast.error(error.message);
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Radio className="size-5 text-primary animate-pulse" />
        <h2 className="text-2xl font-bold">Alertes en temps réel</h2>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Mises à jour live grâce à la communauté.</p>

      {user ? (
        <form onSubmit={submit} className="mt-5 space-y-3 p-4 bg-surface rounded-xl border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={form.alert_type} onValueChange={(v) => setForm({ ...form, alert_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALERT_TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Gravité</Label>
              <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative">
            <Label className="text-xs">Lieu concerné</Label>
            <Input placeholder="Adresse, station, lieu..." value={form.place?.label ?? q} onChange={(e) => { setQ(e.target.value); setForm({ ...form, place: null }); }} />
            {results.length > 0 && !form.place && (
              <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-lg max-h-48 overflow-auto shadow-lg">
                {results.map((r) => (
                  <button type="button" key={r.label} onClick={() => { setForm({ ...form, place: r }); setResults([]); setQ(""); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-accent">{r.label}</button>
                ))}
              </div>
            )}
          </div>
          <Textarea placeholder="Décrivez l'incident (max 500 caractères)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 500) })} rows={2} />
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:opacity-90">
            <AlertTriangle className="size-4 mr-2" /> Signaler
          </Button>
        </form>
      ) : (
        <Link to="/auth"><Button variant="outline" className="mt-5 w-full">Se connecter pour signaler</Button></Link>
      )}

      <div className="mt-6 space-y-3 max-h-[600px] overflow-auto pr-1">
        {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune alerte active.</p>}
        {alerts.map((a) => {
          const sev = SEVERITIES.find((s) => s.v === a.severity) ?? SEVERITIES[0];
          const type = ALERT_TYPES.find((t) => t.v === a.alert_type)?.l ?? a.alert_type;
          return (
            <article key={a.id} className="border border-border rounded-xl p-4 bg-surface">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sev.c}`}>{sev.l}</span>
                    <span className="text-xs font-medium text-foreground">{type}</span>
                  </div>
                  <p className="mt-2 text-sm">{a.description}</p>
                  {a.location_label && <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3" />{a.location_label}</p>}
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{new Date(a.created_at).toLocaleString("fr-FR")}</p>
                </div>
                {user?.id === a.user_id && (
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id)} className="text-xs">Supprimer</Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReviewsPanel() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ rating: 5, comment: "", tags: [] as string[], place: null as GeoPoint | null });
  const [q, setQ] = useState("");
  const [results, setResults] = useState<GeoPoint[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const TAGS = ["Rampe d'accès", "Ascenseur", "Toilettes PMR", "Personnel aidant", "Sans escalier", "Banc/repos"];

  useEffect(() => {
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => data && setReviews(data as Review[]));
    const ch = supabase.channel("reviews-live").on("postgres_changes", { event: "INSERT", schema: "public", table: "reviews" }, (payload) => {
      setReviews((prev) => [payload.new as Review, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    if (q.length < 3) { setResults([]); return; }
    const t = setTimeout(() => { searchPlace(q).then(setResults); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  function toggleTag(t: string) {
    setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { toast.error("Connectez-vous pour laisser un avis"); return; }
    if (!form.place) { toast.error("Choisissez un lieu"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id,
      place_label: form.place.label,
      lat: form.place.lat,
      lng: form.place.lng,
      rating: form.rating,
      comment: form.comment.trim().slice(0, 800) || null,
      tags: form.tags,
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Avis publié, merci !");
      setForm({ rating: 5, comment: "", tags: [], place: null });
      setQ("");
    }
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-primary" />
        <h2 className="text-2xl font-bold">Avis accessibilité</h2>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Notez les lieux selon votre expérience PMR/senior.</p>

      {user ? (
        <form onSubmit={submit} className="mt-5 space-y-3 p-4 bg-surface rounded-xl border border-border">
          <div className="relative">
            <Label className="text-xs">Lieu évalué</Label>
            <Input placeholder="Restaurant, gare, parc..." value={form.place?.label ?? q} onChange={(e) => { setQ(e.target.value); setForm({ ...form, place: null }); }} />
            {results.length > 0 && !form.place && (
              <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-lg max-h-48 overflow-auto shadow-lg">
                {results.map((r) => (
                  <button type="button" key={r.label} onClick={() => { setForm({ ...form, place: r }); setResults([]); setQ(""); }} className="block w-full text-left px-3 py-2 text-sm hover:bg-accent">{r.label}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs">Note</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                  <Star className={`size-7 ${n <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Tags d'accessibilité</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {TAGS.map((t) => (
                <button key={t} type="button" onClick={() => toggleTag(t)} className={`text-xs px-2.5 py-1 rounded-full border transition ${form.tags.includes(t) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>{t}</button>
              ))}
            </div>
          </div>
          <Textarea placeholder="Votre retour (optionnel, max 800 caractères)" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value.slice(0, 800) })} rows={2} />
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:opacity-90">Publier l'avis</Button>
        </form>
      ) : (
        <Link to="/auth"><Button variant="outline" className="mt-5 w-full">Se connecter pour publier un avis</Button></Link>
      )}

      <div className="mt-6 space-y-3 max-h-[600px] overflow-auto pr-1">
        {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun avis pour le moment.</p>}
        {reviews.map((r) => (
          <article key={r.id} className="border border-border rounded-xl p-4 bg-surface">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{r.place_label}</h3>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`size-4 ${n <= r.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
                  ))}
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
            {r.tags && r.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {r.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{t}</span>)}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
