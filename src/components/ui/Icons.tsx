import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20, props: P) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

export const SearchIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.6-4.6" /></svg>
);
export const UserIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" /></svg>
);
export const HeartIcon = ({ size, filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(size, p)} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const BagIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);
export const CloseIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 5l14 14M19 5 5 19" /></svg>
);
export const MenuIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M3 7h18M3 12h18M3 17h12" /></svg>
);
export const ArrowRight = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="M3 12h17M14 6l6 6-6 6" /></svg>
);
export const ArrowLeft = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="M21 12H4M10 6l-6 6 6 6" /></svg>
);
export const ChevronDown = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const ChevronRight = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const ChevronLeft = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="m15 6-6 6 6 6" /></svg>
);
export const Plus = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const Minus = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 12h14" /></svg>
);
export const Check = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const Truck = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" /><circle cx="6" cy="18" r="1.8" /><circle cx="17.5" cy="18" r="1.8" /></svg>
);
export const Shield = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></svg>
);
export const Lock = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><rect x="5" y="10.5" width="14" height="10" rx="1" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg>
);
export const ReturnIcon = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M4 9h11a5 5 0 0 1 0 10H8" /><path d="m8 5-4 4 4 4" /></svg>
);
export const Sparkle = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>
);
export const Gift = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3.5" y="8.5" width="17" height="12" /><path d="M2.5 8.5h19M12 8.5v12M12 8.5S10.5 4 8 4.5 7 8.5 12 8.5ZM12 8.5S13.5 4 16 4.5s1 4-4 4Z" /></svg>
);
export const Chat = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l.9-4.1A8 8 0 1 1 20 12Z" /></svg>
);
export const Phone = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
);
export const Mail = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="5" width="18" height="14" /><path d="m3 6 9 7 9-7" /></svg>
);
export const Pin = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
);
export const Zoom = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
export const Filter = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
);
export const Ruler = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="m3 15 12-12 6 6L9 21l-6-6Z" /><path d="m7 11 2 2M10 8l2 2M13 5l2 2" /></svg>
);
export const Star = ({ size = 13, filled = true, ...p }: P & { filled?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable={false} {...p}>
    <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8L12 2.8Z" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.1} />
  </svg>
);
export const Grid = ({ cols, size = 16, ...p }: P & { cols: 2 | 3 | 4 }) => (
  <svg {...base(size, p)}>
    {Array.from({ length: cols }, (_, i) => {
      const w = (18 - (cols - 1) * 2) / cols;
      return <rect key={i} x={3 + i * (w + 2)} y="4" width={w} height="16" />;
    })}
  </svg>
);
export const Instagram = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>
);
export const Youtube = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="m10 9.2 5 2.8-5 2.8V9.2Z" fill="currentColor" /></svg>
);
export const Pinterest = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="9" /><path d="M10.5 20.5 12 14m0 0c.5 1 1.5 1.5 2.5 1.5 2.2 0 3.5-2 3.5-4.5a6 6 0 0 0-12 .5c0 1.2.4 2.2 1.2 2.8M12 14l1-4.5" /></svg>
);
export const Facebook = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}><path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6.5H14V14h2.5l.5-3.5h-3V8.5c0-.3.2-.5.5-.5Z" /></svg>
);
export const Home = ({ size, ...p }: P) => (
  <svg {...base(size, p)}><path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4v-9.5Z" /></svg>
);
export const Upload = ({ size = 18, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" /></svg>
);
