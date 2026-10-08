import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { PaymentBadges } from "@/components/common/PaymentBadges";
import { Facebook, Instagram, Pinterest, Youtube } from "@/components/ui/Icons";
import { CookieSettingsLink } from "@/components/common/CookieBanner";
import { Doodle, type DoodleName } from "@/components/doodles/Doodle";
import { FooterMeta } from "./FooterMeta";

/** The tailor's bench, scattered along the bottom of every page: [doodle, width class, rotation, vertical nudge]. */
const BENCH: [DoodleName, string, number, string][] = [
  ["hanger", "w-20 md:w-28", -8, "mt-6"],
  ["spool", "w-12 md:w-16", 6, "mt-0"],
  ["shirt", "w-20 md:w-28", -4, "mt-10"],
  ["scissors", "w-16 md:w-24", 14, "mt-2"],
  ["button", "w-10 md:w-14", 0, "mt-14"],
  ["bowtie", "w-16 md:w-24", -10, "mt-4"],
  ["iron", "w-20 md:w-28", 4, "mt-12"],
  ["tape", "w-16 md:w-24", -6, "mt-0"],
  ["tie", "w-12 md:w-16", 12, "mt-8"],
  ["needle", "w-16 md:w-24", -14, "mt-2"],
  ["cup", "w-14 md:w-20", 6, "mt-12"],
  ["coat", "w-20 md:w-28", -3, "mt-4"],
  ["glasses", "w-16 md:w-24", 8, "mt-10"],
  ["tee", "w-16 md:w-24", -6, "mt-0"],
];

const SOCIAL = [
  [site.social.instagram, "Instagram", Instagram],
  [site.social.youtube, "YouTube", Youtube],
  [site.social.pinterest, "Pinterest", Pinterest],
  [site.social.facebook, "Facebook", Facebook],
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-burgundy bg-ivory pb-24 text-ink md:pb-0">
      {/* Letters + links */}
      <div className="container-site grid gap-14 pt-16 md:grid-cols-12 md:pt-24">
        <div className="md:col-span-5">
          <h2 className="display-md max-w-sm text-burgundy">
            Letters from the <em className="italic">studio</em>
          </h2>
          <p className="mt-4 max-w-sm font-mono text-[12.5px] leading-[1.8] text-muted">New pieces, early access and the odd story from the cutting table. Plus 10% off your first order.</p>
          <NewsletterForm source="footer" className="mt-7 max-w-md" />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-7 md:pl-8">
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h3 className="eyebrow mb-4 text-burgundy">{title}</h3>
              <ul className="space-y-1">
                {links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="link-u inline-block py-1 font-mono text-[12.5px] text-charcoal transition-colors hover:text-burgundy">
                      {l}
                    </Link>
                  </li>
                ))}
                {title === "Legal" && (
                  <li>
                    <CookieSettingsLink className="link-u font-mono text-[12.5px] text-charcoal transition-colors hover:text-burgundy" />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Care, payments, social */}
      <div className="container-site mt-14 flex flex-col gap-8 border-y border-line py-8 font-mono text-[12px] md:flex-row md:items-center md:justify-between">
        <p className="leading-relaxed text-charcoal">
          <a href={`mailto:${site.email}`} className="link-u hover:text-burgundy">
            {site.email}
          </a>
          <span aria-hidden className="mx-2 text-muted">/</span>
          <a href={site.whatsappHref} className="link-u hover:text-burgundy" target="_blank" rel="noopener noreferrer">
            WhatsApp {site.whatsapp}
          </a>
          <span className="block text-muted">{site.hours}</span>
        </p>
        <PaymentBadges />
        <ul className="flex gap-2">
          {SOCIAL.map(([href, label, Icon]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Threads Ware on ${label}`} className="grid h-11 w-11 place-items-center rounded-full border-2 border-burgundy text-burgundy transition-colors duration-300 hover:bg-burgundy hover:text-cream">
                <Icon size={16} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Sign */}
      <div className="container-site pt-14 md:pt-20">
        <p aria-hidden className="sign-word select-none text-balance text-center text-[clamp(3.2rem,11.6vw,13rem)]">
          Made to be worn
        </p>
      </div>

      {/* The bench */}
      <div aria-hidden className="container-site flex flex-wrap items-start justify-center gap-x-6 gap-y-4 pb-10 pt-12 text-burgundy md:flex-nowrap md:justify-between md:gap-x-4 md:pb-14">
        {BENCH.map(([name, w, r, mt], i) => (
          <div key={name} className={`${w} ${mt} shrink-0 transition-transform duration-500 ease-[var(--ease-lux)] hover:-translate-y-1.5 ${i > 9 ? "max-md:hidden" : ""}`} style={{ rotate: `${r}deg` }}>
            <Doodle name={name} strokeWidth={1.5} />
          </div>
        ))}
      </div>

      <div className="container-site flex flex-col items-start justify-between gap-5 border-t border-line py-7 md:flex-row md:items-center">
        <Wordmark compact className="text-burgundy" />
        <p className="font-mono text-[11px] tracking-wide text-muted">
          © {new Date().getFullYear()} THREADS WARE. GSTIN {site.gstin}.
        </p>
        <FooterMeta />
      </div>
    </footer>
  );
}
