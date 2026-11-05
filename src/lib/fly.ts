"use client";

/**
 * Throws a little copy of a product photo from `from` into the visible bag icon along a curved path,
 * then gives the bag a squeeze. Resolves when it lands (immediately under reduced motion or if no bag is on screen),
 * so callers can open the drawer or show a toast after the flight instead of on top of it.
 */
export function flyToBag(from: Element | null | undefined, src?: string): Promise<void> {
  if (typeof window === "undefined" || !from) return Promise.resolve();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  const target = [...document.querySelectorAll<HTMLElement>("[data-bag-target]")].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  });
  if (!target) return Promise.resolve();

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const size = Math.min(140, Math.max(64, a.width * 0.45));
  const img = src || (from.querySelector("img") as HTMLImageElement | null)?.currentSrc;
  const ghost = document.createElement("div");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size * 0.625}px`,
    width: `${size}px`,
    height: `${size * 1.25}px`,
    borderRadius: "0",
    border: "3px solid #fff",
    background: img ? `center / cover no-repeat url("${img}")` : "var(--color-burgundy)",
    boxShadow: "0 18px 40px -16px rgb(62 33 23 / 0.6)",
    zIndex: "400",
    pointerEvents: "none",
    willChange: "transform, opacity",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const lift = Math.min(-80, dy * 0.35 - 120); // arc up before dropping into the bag
  const anim = ghost.animate(
    [
      { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${lift}px) scale(0.75) rotate(-14deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(8deg)`, opacity: 0.6 },
    ],
    { duration: 780, easing: "cubic-bezier(0.55, 0, 0.35, 1)", fill: "forwards" },
  );
  return anim.finished
    .catch(() => undefined)
    .then(() => {
      ghost.remove();
      target.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.35) rotate(-8deg)" }, { transform: "scale(0.92) rotate(4deg)" }, { transform: "scale(1)" }],
        { duration: 520, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    });
}

/** A small burst of hearts/sparks from an element — used when something is saved. */
export function burst(from: Element | null | undefined, color = "var(--color-denim)") {
  if (typeof window === "undefined" || !from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = from.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < 9; i++) {
    const s = document.createElement("span");
    const angle = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 22 + Math.random() * 18;
    const size = i % 3 === 0 ? 7 : 5;
    Object.assign(s.style, {
      position: "fixed",
      left: `${cx - size / 2}px`,
      top: `${cy - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: i % 3 === 0 ? "2px" : "999px",
      background: i % 2 ? color : "var(--color-ochre)",
      zIndex: "400",
      pointerEvents: "none",
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(s);
    s.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0.3) rotate(${Math.random() * 180}deg)`, opacity: 0 },
      ],
      { duration: 560 + Math.random() * 200, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
    ).finished.then(() => s.remove(), () => s.remove());
  }
}
