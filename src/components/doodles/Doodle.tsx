import { cn } from "@/lib/cn";

/** Circle as a path so every stroke can be drawn in with the same dash trick. */
const ring = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

/**
 * Pen-line illustrations of the tailor's bench, drawn by hand on a 100×100 grid.
 * Lines are deliberately a little uneven — they should read as sketched, not generated.
 */
const DOODLES = {
  shirt: [
    "M30 19 L42 12 Q50 21 58 12 L70 19 L88 35 L80 47 L72 41 L72.5 88 Q50 91.5 27.5 88 L28 41 L20 47 L12 35 Z",
    "M42 12 L49.5 27 L58 12",
    "M49.5 27 L50 87",
    ring(50, 37, 1.4), ring(50, 51, 1.4), ring(50, 65, 1.4), ring(50.2, 79, 1.4),
    "M58 42 h9.5 v10 q-4.7 2.2 -9.5 0 z",
  ],
  tee: ["M31 20 L40.5 14 Q50 24 59.5 14 L69 20 L88 32.5 L80.5 46 L70 40.5 L70.5 87.5 L29.5 88 L30 40.5 L19.5 46 L12 32.5 Z", "M40.5 14 Q50 30 59.5 14", "M37 76 q6 -2 12 1"],
  hanger: ["M50 31 q0 -8 6 -10.5 q6 -2.5 6 -8 q0 -6.5 -6.5 -7 q-6 0 -7 5", "M50 31 L12 58.5 q-3 3.2 2 4 L86 62 q5 -1 2.2 -4 Z"],
  needle: [
    "M16 86 L72.5 22.5 Q79 15.5 82.5 19.5 Q84 24 77 27.5 Z",
    "M75 22.5 L78.5 21",
    "M79.5 21 C96 10 93 41 70 44.5 C45 48.5 61 71 40 72.5 C25 74 21.5 62 32 58 C44 54 48.5 80.5 30 92",
  ],
  scissors: [ring(29, 74, 10.5), ring(52, 82.5, 10), "M37 66.5 L82.5 15.5 Q79 31 43.5 71.5", "M57 73 L88.5 30.5 Q80 31.5 50.5 72", ring(46, 66.5, 1.3)],
  button: [ring(50, 50, 34), ring(50, 50, 27), ring(42.5, 42.5, 3.4), ring(57.5, 42.5, 3.4), ring(42.5, 57.5, 3.4), ring(57.5, 57.5, 3.4), "M42.5 42.5 L57.5 57.5 M57.5 42.5 L42.5 57.5"],
  spool: [
    "M29 19.5 h42 v8.5 h-42 z",
    "M29 72 h42 v8.5 h-42 z",
    "M36 28 v44 M64 28 v44",
    "M36 34 L64 38.5 M36 42 L64 46.5 M36 50 L64 54.5 M36 58 L64 62.5 M36 66 L64 70",
    "M64 60 C81 64 91 80.5 74 91",
  ],
  tape: [ring(33, 64, 18.5), ring(33, 64, 6), "M51 61 L89 29.5 L94 36 L56 69", "M60 60.5 l3.2 3.4 M68 53.8 l3.2 3.4 M76 47 l3.2 3.4 M84 40.4 l3.2 3.4"],
  bowtie: ["M44 43 L17.5 29 Q11 50 17.5 71 L44 57", "M56 43 L82.5 29 Q89 50 82.5 71 L56 57", "M44 42 Q50 39.5 56 42 L56 58 Q50 60.5 44 58 Z", "M23 40 q4 10 0 20 M77 40 q-4 10 0 20"],
  iron: [
    "M13 71 Q19 40 60 38 L87 38 L87 71 Z",
    "M40 38 Q41.5 21.5 60 22 L80 22 Q86.5 22 87 30",
    "M30 58 h2 M42 58 h2 M54 58 h2 M66 58 h2",
    "M24 30 q-4 -6 0 -12 q4 -6 0 -12",
  ],
  tie: ["M43.5 13 h13 l-2.5 10.5 h-8 z", "M46 23.5 L37.5 70 L50 88.5 L62.5 70 L54 23.5", "M41.5 49 L58.5 39.5 M39.5 61.5 L60.5 49.5"],
  cup: ["M23 40 h45 v20 q0 22.5 -22.5 22.5 q-22.5 0 -22.5 -22.5 z", "M68 46 q14.5 0 14.5 10 q0 10.5 -14.5 10", "M38 32 q-4 -6 0 -12 q4 -6 0 -12 M52 32 q-4 -6 0 -12 q4 -6 0 -12", "M15 87 h61"],
  glasses: [ring(31.5, 53, 14), ring(68.5, 53, 14), "M45.5 50.5 Q50 46 54.5 50.5", "M17.5 50 L7.5 43.5 M82.5 50 L92.5 43.5"],
  sparkle: ["M50 11 Q54.5 45.5 89 50 Q54.5 54.5 50 89 Q45.5 54.5 11 50 Q45.5 45.5 50 11 Z"],
  arrow: ["M9 62 C24 30 40 81 55 50 S80 29 88.5 44", "M79.5 36 L88.5 44 L78 48.5"],
  heart: ["M50 82 C18 60 14 40 26 29 C36 20 47 26 50 35 C53 26 64 20 74 29 C86 40 82 60 50 82 Z"],
  coat: [
    "M36 13 L50 25 L64 13 L76 18 L88 64 L80 67 L74 44 L75 90 L25 90 L26 44 L20 67 L12 64 L24 18 Z",
    "M36 13 L42 34 L50 25 L58 34 L64 13",
    "M50 25 L50 90",
    "M30 66 h11 M59 66 h11",
  ],
} satisfies Record<string, string[]>;

export type DoodleName = keyof typeof DOODLES;

export function Doodle({ name, className, strokeWidth = 1.6, draw = false, delay = 0, title }: { name: DoodleName; className?: string; strokeWidth?: number; draw?: boolean; delay?: number; title?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("doodle overflow-visible", draw && "doodle-draw", className)}
      style={draw ? ({ "--d": `${delay}ms` } as React.CSSProperties) : undefined}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {DOODLES[name].map((d, i) => (
        <path key={i} d={d} pathLength={1} />
      ))}
    </svg>
  );
}
