"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Squiggle } from "@/components/ui/SectionTitle";
import { ArrowRight } from "@/components/ui/Icons";
import { IMG } from "@/data/images";

/** Oxblood colour block: why we make what we make, with two photos that slide in from the right. */
export function WelcomeBlock() {
  const reduce = useReducedMotion();
  const slide = (delay: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : 80, filter: reduce ? "none" : "blur(12px)" },
    whileInView: { opacity: 1, x: 0, filter: "blur(0px)" },
    viewport: { once: true, margin: "0px 0px -15% 0px" },
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const, delay },
  });
  return (
    <section aria-labelledby="welcome-title" className="overflow-hidden bg-burgundy text-cream">
      <div className="container-site grid items-center gap-14 py-20 md:grid-cols-2 md:gap-10 md:py-28">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -15% 0px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="is-in max-w-lg">
          <p className="eyebrow text-champagne-soft">Our story</p>
          <h2 id="welcome-title" className="display-lg mt-4">
            Dressed for every <span className="text-ochre">table</span>
          </h2>
          <Squiggle className="mt-5 text-ochre" />
          <p className="mt-7 text-[15px] leading-[1.8] text-cream/85">
            We make clothes for the moments that bring people together — long Sunday lunches, loud weddings, early Mondays and everything in between. Shirts, tees and tailoring that are easy to wear, cut with care and made to stay in your life for years.
          </p>
          <Link href="/our-story" className="btn btn-light mt-9">
            Our story <ArrowRight size={13} className="btn-arrow" />
          </Link>
        </motion.div>

        <div className="relative mx-auto w-full max-w-[560px]">
          <motion.div {...slide(0)} className="relative ml-auto aspect-[4/5] w-[78%] overflow-hidden rounded-[26px]">
            <Image src={IMG.manCasualSeated} alt="Man in a camel blazer and white tee seated on a stool" fill sizes="(max-width:768px) 70vw, 440px" className="object-cover object-[50%_30%]" />
          </motion.div>
          <motion.div {...slide(0.18)} className="absolute -bottom-8 left-0 aspect-square w-[44%] overflow-hidden rounded-card ring-[6px] ring-burgundy">
            <Image src={IMG.manWindow} alt="Man sitting in a circular window in a field jacket" fill sizes="(max-width:768px) 40vw, 250px" className="object-cover" />
          </motion.div>
          <motion.span {...slide(0.35)} className="absolute right-[6%] top-6 rounded-full bg-ochre px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink">
            Since 2021
          </motion.span>
        </div>
      </div>
    </section>
  );
}
