import { useEffect, useState } from "react";
import { searchPlace, type GeoPoint } from "@/lib/mobilis";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";

export function PlaceSearch({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: GeoPoint | null;
  onChange: (g: GeoPoint | null) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState(value?.label ?? "");
  const [results, setResults] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!q || q === value?.label) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchPlace(q);
        setResults(r);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q, value?.label]);

  return (
    <div className="relative">
      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1 relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (!e.target.value) onChange(null);
          }}
          onFocus={() => results.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-9 bg-surface border-border h-11"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => {
                onChange(r);
                setQ(r.label);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary border-b border-border last:border-0"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
