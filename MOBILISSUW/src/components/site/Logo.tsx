import logoSrc from "@/assets/mobilis-logo.png";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoSrc}
        alt="Mobilis logo"
        width={size}
        height={size}
        className="rounded-xl"
        style={{ width: size, height: size }}
      />
      <span className="font-bold tracking-tight text-foreground" style={{ fontSize: size * 0.55 }}>
        Mobilis
      </span>
    </div>
  );
}
