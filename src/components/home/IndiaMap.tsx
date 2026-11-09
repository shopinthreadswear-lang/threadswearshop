"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const INDIA =
  "M97.8 10.0C102.8 6.4 109.3 13.9 116.7 17.8C124.1 21.7 135.6 27.5 142.3 33.2C149.1 38.9 155.8 44.4 157.2 51.9C158.5 59.4 149.7 69.7 150.4 78.2C151.1 86.7 155.6 96.8 161.2 103.0C166.8 109.2 179.9 109.5 184.2 115.4C188.5 121.4 181.4 131.5 186.8 138.7C192.2 145.9 205.9 153.4 216.5 158.8C227.1 164.2 239.5 168.6 250.3 171.2C261.1 173.8 275.9 176.1 281.3 174.3C286.7 172.5 280.9 162.6 282.7 160.3C284.5 158.0 288.6 158.7 292.2 160.3C295.8 161.9 297.1 168.6 304.3 169.7C311.5 170.8 330.6 169.4 335.3 166.6C340.0 163.8 327.1 158.8 332.7 152.6C338.3 146.4 359.2 132.4 369.1 129.3C379.0 126.2 385.7 131.2 392.0 134.0C398.3 136.8 407.6 142.0 406.9 146.4C406.2 150.8 392.9 155.9 388.0 160.3C383.1 164.7 380.3 167.4 377.2 172.8C374.1 178.2 371.4 185.9 369.1 192.9C366.9 199.9 366.6 208.9 363.7 214.6C360.8 220.3 354.2 222.6 351.5 227.0C348.8 231.4 349.5 241.9 347.5 240.9C345.5 239.9 342.1 226.0 339.4 220.8C336.7 215.6 335.8 214.6 331.3 209.9C326.8 205.2 318.7 197.0 312.4 192.9C306.1 188.8 297.8 185.5 293.5 185.2C289.2 184.9 286.8 186.9 286.8 191.3C286.8 195.7 292.8 203.8 293.5 211.5C294.2 219.2 295.3 231.4 290.8 237.8C286.3 244.2 271.0 245.3 266.5 250.2C262.0 255.1 268.3 261.6 263.8 267.3C259.3 273.0 246.9 278.1 239.5 284.3C232.1 290.5 225.5 297.5 219.2 304.5C212.9 311.5 207.3 320.5 201.7 326.2C196.1 331.9 190.0 335.0 185.5 338.6C181.0 342.2 176.3 341.4 174.7 347.9C173.1 354.3 176.9 367.8 176.0 377.3C175.1 386.9 170.4 397.4 169.3 405.2C168.2 412.9 171.3 417.9 169.3 423.8C167.3 429.8 162.4 435.2 157.2 440.9C152.0 446.6 143.4 457.1 138.2 457.9C133.0 458.7 129.0 450.5 126.1 445.6C123.2 440.7 122.7 435.7 120.7 428.5C118.7 421.3 117.2 409.7 114.0 402.2C110.8 394.7 105.4 391.6 101.8 383.6C98.2 375.6 95.4 363.4 92.3 354.1C89.2 344.8 85.8 338.7 82.9 327.8C80.0 316.9 76.4 300.6 74.8 289.0C73.2 277.4 74.2 265.2 73.5 258.0C72.8 250.8 74.2 245.1 70.8 245.6C67.4 246.1 58.8 259.0 53.2 261.1C47.6 263.2 42.0 261.9 37.0 258.0C32.0 254.1 23.5 242.7 23.5 237.8C23.5 232.9 37.7 231.9 37.0 228.6C36.3 225.2 23.3 219.8 19.5 217.7C15.7 215.6 12.0 218.0 14.0 216.2C16.0 214.4 25.5 208.6 31.6 206.8C37.7 205.0 48.7 208.9 50.5 205.3C52.3 201.7 44.6 190.9 42.4 185.2C40.1 179.5 38.8 175.1 37.0 171.2C35.2 167.3 30.2 165.5 31.6 161.9C33.0 158.3 39.7 154.2 45.1 149.5C50.5 144.8 57.7 138.9 64.0 134.0C70.3 129.1 77.3 125.0 82.9 120.1C88.5 115.2 95.1 109.8 97.8 104.6C100.5 99.4 97.5 93.0 99.1 89.1C100.7 85.2 107.4 83.6 107.2 81.3C107.0 79.0 100.7 78.5 97.8 75.1C94.9 71.7 90.8 65.5 89.7 61.1C88.6 56.7 91.5 52.4 91.0 48.8C90.5 45.2 85.9 45.9 87.0 39.4C88.1 32.9 92.8 13.6 97.8 10.0Z";

const CITIES: [string, number, number][] = [
  ["Delhi", 134.2, 140.2],
  ["Mumbai", 75.9, 287.8],
  ["Bengaluru", 139.6, 382.5],
  ["Hyderabad", 151.8, 313.8],
  ["Chennai", 175.6, 380.8],
  ["Kolkata", 284.9, 233.7],
  ["Pune", 89.1, 296.4],
  ["Ahmedabad", 71.7, 226.7],
  ["Jaipur", 115.2, 166.4],
  ["Chandigarh", 128.5, 107.2],
  ["Kochi", 121.6, 429.6],
  ["Lucknow", 184.8, 167.3],
  ["Guwahati", 330.5, 178.3],
  ["Indore", 116.1, 231.3],
  ["Bhubaneswar", 250.6, 268.8],
  ["Goa", 89.7, 344.8],
];

/** Teardrop map pin, drawn with its tip on (0,0). */
const PIN = "M0 0 C-3 -6 -9 -10 -9 -17 a9 9 0 0 1 18 0 C9 -10 3 -6 0 0Z";

/**
 * Hand-drawn map of India. When it scrolls into view the outline is inked in, the paper fills behind it,
 * then each pin drops onto its city with a bounce and starts to pulse.
 */
export function IndiaMap() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const show = inView || !!reduce;
  return (
    <svg ref={ref} viewBox="0 0 420 470" className="w-full overflow-visible" role="img" aria-label="Map of India marking cities we deliver to, including Delhi, Mumbai, Bengaluru, Chennai and Kolkata">
      <motion.path d={INDIA} fill="var(--color-champagne-soft)" transform="translate(5 6)" initial={{ opacity: 0 }} animate={{ opacity: show ? 0.22 : 0 }} transition={{ delay: 1.3, duration: 0.6 }} />
      <motion.path
        d={INDIA}
        stroke="var(--color-cream)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0, fill: "rgba(248,239,223,0)" }}
        animate={show ? { pathLength: 1, fill: "rgba(248,239,223,1)" } : undefined}
        transition={{ pathLength: { duration: 1.6, ease: [0.65, 0, 0.35, 1] }, fill: { delay: 1.2, duration: 0.7 } }}
      />
      {CITIES.map(([name, x, y], k) => (
        <g key={name} transform={`translate(${x} ${y})`}>
          <title>{name}</title>
          <motion.g initial={{ y: reduce ? 0 : -60, opacity: reduce ? 1 : 0 }} animate={show ? { y: 0, opacity: 1 } : undefined} transition={{ type: "spring", stiffness: 380, damping: 14, delay: 1.5 + k * 0.07 }}>
            <circle r="7" fill="var(--color-burgundy)" className="pin-pulse" style={{ "--d": `${1800 + (k % 5) * 380}ms` } as React.CSSProperties} />
            <path d={PIN} fill="var(--color-burgundy)" />
            <circle cy="-17" r="3.4" fill="var(--color-cream)" />
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
