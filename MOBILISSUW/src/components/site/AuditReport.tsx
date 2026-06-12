import { formatDistance, formatDuration, type RouteResult } from "@/lib/mobilis";
import { Button } from "@/components/ui/button";
import { Download, Share2, FileText, Shield } from "lucide-react";

interface Props {
  origin: { lat: number; lng: number; label: string };
  destination: { lat: number; lng: number; label: string };
  route: RouteResult;
}

export function AuditReport({ origin, destination, route }: Props) {
  const date = new Date().toLocaleString("fr-FR");
  const constraintsList = [
    route.constraints.avoid_stairs && "Escaliers évités",
    route.constraints.avoid_steep && "Pentes raides évitées",
    route.constraints.prefer_rest_stops && "Points de repos privilégiés",
  ].filter(Boolean) as string[];

  function downloadJSON() {
    const payload = { generated_at: date, origin, destination, ...route };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mobilis-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    window.print();
  }

  async function share() {
    const text = `Trajet Mobilis : ${origin.label} → ${destination.label} (${formatDistance(route.distance_m)}, ${formatDuration(route.duration_s)})`;
    if (navigator.share) {
      try { await navigator.share({ title: "Audit Mobilis", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Résumé copié dans le presse-papier");
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 print:bg-white print:text-black">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary font-semibold flex items-center gap-2">
            <Shield className="size-3.5" /> Rapport d'audit accessibilité
          </div>
          <h3 className="text-2xl font-bold mt-1">Trajet généré</h3>
          <p className="text-xs text-muted-foreground mt-1">{date}</p>
        </div>
        <FileText className="size-7 text-primary shrink-0" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Field label="Départ" value={origin.label} />
        <Field label="Arrivée" value={destination.label} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Distance" value={formatDistance(route.distance_m)} />
        <Stat label="Durée estimée" value={formatDuration(route.duration_s)} />
        <Stat label="Étapes" value={String(route.steps)} />
      </div>

      <div className="mb-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">Contraintes prises en compte</div>
        <div className="flex flex-wrap gap-2">
          {constraintsList.length === 0 ? (
            <span className="text-sm text-muted-foreground">Aucune contrainte particulière</span>
          ) : (
            constraintsList.map((c) => (
              <span key={c} className="text-xs bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full font-medium">
                ✓ {c}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t border-border print:hidden">
        <Button onClick={printPdf} size="sm" variant="outline"><Download className="size-4 mr-1.5" /> PDF</Button>
        <Button onClick={downloadJSON} size="sm" variant="outline"><Download className="size-4 mr-1.5" /> JSON</Button>
        <Button onClick={share} size="sm" className="bg-primary text-primary-foreground hover:opacity-90"><Share2 className="size-4 mr-1.5" /> Partager</Button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg p-3 border border-border">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</div>
      <div className="text-sm font-medium mt-1 line-clamp-2">{value}</div>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-lg p-3 border border-border text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
