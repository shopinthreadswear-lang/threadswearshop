"use client";

import { useEffect, useState } from "react";
import { getLenis } from "@/components/motion/SmoothScroll";
import { ArrowRight } from "@/components/ui/Icons";

/** Live studio clock + back-to-top. Small, human details for the end of every page. */
export function FooterMeta() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata", hour12: false }).format(new Date());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clock starts on the client
    setTime(fmt());
    const t = setInterval(() => setTime(fmt()), 30_000);
    return () => clearInterval(t);
  }, []);
  const top = () => {
    const l = getLenis();
    if (l) l.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return (
    <div className="flex items-center gap-6 text-[11.5px] text-ivory/55">
      <span>
        Mumbai studio <span className="tabular-nums text-ivory/85">{time ?? "--:--"}</span> IST
      </span>
      <button type="button" onClick={top} className="group flex items-center gap-2 uppercase tracking-[0.16em] text-ivory/80 hover:text-ivory">
        Back to top <ArrowRight size={13} className="-rotate-90 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
}
