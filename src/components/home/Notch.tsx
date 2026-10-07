import { cn } from "@/lib/cn";

/**
 * "Folder tab" cut in a card's top edge, drawn in the page colour (so it reads as a cut-out).
 * side = where the raised tab sits. Three pieces: the step, the tab's rounded shoulder, and the card's lowered corner.
 */
export function Notch({ side = "right", start = "58%", className }: { side?: "left" | "right"; start?: string; className?: string }) {
  const R = 20; // matches the card radius (rounded-[20px]) so the cut meets the corner cleanly
  const bg = "var(--notch-bg, var(--color-ivory))";
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 z-10 block h-[20px]", side === "left" && "-scale-x-100", className)}>
      {/* lowered section with a soft step up into the tab */}
      <span className="absolute left-0 top-0 block" style={{ width: `calc(${start} + 0.5px)`, height: R, background: bg, borderBottomRightRadius: R }} />
      {/* rounded top-left shoulder of the tab */}
      <span className="absolute top-0 block" style={{ left: start, width: R, height: R, background: `radial-gradient(circle at 100% 100%, transparent ${R - 0.5}px, ${bg} ${R}px)` }} />
      {/* rounded corner of the lowered edge */}
      <span className="absolute left-0 block" style={{ top: R, width: R, height: R, background: `radial-gradient(circle at 100% 100%, transparent ${R - 0.5}px, ${bg} ${R}px)` }} />
    </span>
  );
}
