import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Accessibility, FileBarChart, Heart, Sparkles, Shield, Route as RouteIcon } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import peopleMobility from "@/assets/people-mobility.jpg";
import phoneMap from "@/assets/phone-map.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mobilis — La navigation accessible pour seniors et PMR" },
      { name: "description", content: "Mobilis calcule des trajets adaptés aux personnes à mobilité réduite et aux seniors : sans escalier, sans pente raide, avec points de repos et rapport d'audit exportable." },
      { property: "og:title", content: "Mobilis — La navigation accessible" },
      { property: "og:description", content: "Des itinéraires sûrs et adaptés, et un rapport d'audit accessibilité pour chaque trajet." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-dvh">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ImpactBanner />
        <HowItWorks />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-5 pt-16 pb-20 md:pt-24 md:pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 border border-primary/30 rounded-full px-3 py-1.5">
            <Sparkles className="size-3.5" /> Startup en compétition
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight">
            La navigation <span className="text-primary">pensée pour tous</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Mobilis est le Google Maps des seniors et des personnes à mobilité réduite. Des trajets adaptés, sans escaliers ni pentes raides, et un rapport d'audit accessibilité à chaque déplacement.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/planner">
              <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 font-semibold rounded-full px-7 h-12 text-base">
                Planifier mon trajet <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
            <Link to="/auth" search={{ mode: "signup" }}>
              <Button size="lg" variant="outline" className="rounded-full px-7 h-12 text-base">
                Créer un compte
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-7 text-sm text-muted-foreground">
            <Stat n="100%" l="Accessible" />
            <div className="h-8 w-px bg-border" />
            <Stat n="0€" l="Gratuit" />
            <div className="h-8 w-px bg-border" />
            <Stat n="OSM" l="Données ouvertes" />
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl opacity-30 blur-3xl" style={{ background: "var(--gradient-brand)" }} />
          <img src={peopleMobility} alt="Un senior et une personne en fauteuil dans la rue" width={1400} height={900} className="relative rounded-3xl border border-border shadow-2xl w-full h-auto object-cover" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-foreground">{n}</div>
      <div className="text-xs uppercase tracking-widest">{l}</div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: Accessibility, t: "Itinéraires adaptés", d: "Évitez automatiquement escaliers, trottoirs cassés et pentes trop raides. Trajets calculés pour fauteuils, déambulateurs, cannes." },
    { icon: Heart, t: "Profil personnalisé", d: "Configurez vos préférences une fois : type de mobilité, vitesse, besoin de points de repos. Tous vos trajets s'y adaptent." },
    { icon: FileBarChart, t: "Rapport d'audit", d: "Chaque trajet génère un rapport exportable (PDF / JSON) : carte, distance, durée, contraintes évitées. Partageable en un clic." },
    { icon: MapPin, t: "Avis communautaires", d: "Notez les lieux, signalez les obstacles. Une cartographie vivante de l'accessibilité réelle, pour tous." },
    { icon: Shield, t: "Sûr & privé", d: "Vos données restent les vôtres. Stockage chiffré, jamais revendu, conformité RGPD by design." },
    { icon: RouteIcon, t: "Optimisation continue", d: "Plus la communauté grandit, plus les trajets deviennent précis. Mobilis apprend de chaque retour." },
  ];
  return (
    <section id="features" className="container mx-auto max-w-7xl px-5 py-20 md:py-28">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">Fonctionnalités</div>
        <h2 className="mt-3 text-4xl md:text-5xl font-bold">Pensé pour ceux que les apps oublient.</h2>
        <p className="mt-4 text-muted-foreground text-lg">Une expérience de navigation construite avec les utilisateurs, pas pour eux.</p>
      </div>
      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it) => (
          <div key={it.t} className="group bg-card border border-border rounded-2xl p-7 hover:border-primary/40 hover:bg-surface transition">
            <div className="size-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
              <it.icon className="size-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold">{it.t}</h3>
            <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ImpactBanner() {
  return (
    <section id="impact" className="container mx-auto max-w-7xl px-5 py-10">
      <div className="relative rounded-3xl overflow-hidden border border-border">
        <img src={heroCity} alt="Boulevard urbain dense au coucher du soleil" width={1600} height={900} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-35" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, oklch(0.18 0.13 273 / 0.92) 0%, oklch(0.18 0.13 273 / 0.55) 65%, transparent 100%)" }} />
        <div className="relative p-10 md:p-16 max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">L'impact</div>
          <h2 className="mt-3 text-4xl md:text-6xl font-bold leading-[1.05]">Moins d'obstacles.<br />Plus d'autonomie.</h2>
          <p className="mt-5 text-base md:text-lg text-foreground/85 max-w-xl">
            En France, 12 millions de personnes vivent avec une mobilité réduite. Chaque trajet Mobilis, c'est une sortie de plus, un trottoir évité, un audit qui pousse les villes à s'améliorer.
          </p>
          <Link to="/planner" className="inline-block mt-7">
            <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 font-semibold rounded-full px-7 h-12">
              Rejoindre Mobilis →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Indiquez votre destination", d: "Tapez une adresse, un lieu, un commerce. Mobilis suggère en temps réel grâce à OpenStreetMap." },
    { n: "02", t: "On calcule l'itinéraire adapté", d: "Selon votre profil mobilité, on évite les escaliers, les pentes, et on privilégie les zones piétonnes accessibles." },
    { n: "03", t: "Recevez votre rapport d'audit", d: "Carte, durée, contraintes évitées : exportez en PDF ou partagez. Contribuez à cartographier l'accessibilité." },
  ];
  return (
    <section id="how" className="container mx-auto max-w-7xl px-5 py-20 md:py-28">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">Comment ça marche</div>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold">Trois étapes, zéro friction.</h2>
          <div className="mt-10 space-y-7">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-5">
                <div className="text-3xl font-bold text-primary shrink-0 w-14">{s.n}</div>
                <div>
                  <h3 className="text-xl font-semibold">{s.t}</h3>
                  <p className="text-muted-foreground mt-1.5">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-3xl opacity-30 blur-3xl" style={{ background: "var(--gradient-brand)" }} />
          <img src={phoneMap} alt="Smartphone affichant un trajet accessible" width={1200} height={900} loading="lazy" className="relative rounded-3xl border border-border shadow-2xl w-full h-auto object-cover" />
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="container mx-auto max-w-5xl px-5 py-20">
      <div className="bg-card border border-border rounded-3xl p-10 md:p-16 text-center" style={{ boxShadow: "var(--shadow-glow)" }}>
        <h2 className="text-4xl md:text-5xl font-bold">Prêt à essayer Mobilis ?</h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">Créez votre compte, configurez votre profil mobilité, et lancez votre premier trajet en moins de 2 minutes.</p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link to="/auth" search={{ mode: "signup" }}>
            <Button size="lg" className="bg-primary text-primary-foreground hover:opacity-90 font-semibold rounded-full px-8 h-12">Créer un compte gratuit</Button>
          </Link>
          <Link to="/planner">
            <Button size="lg" variant="outline" className="rounded-full px-8 h-12">Essayer sans compte</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
