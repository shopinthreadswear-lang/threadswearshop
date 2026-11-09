import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { PaymentBadges } from "@/components/common/PaymentBadges";
import { Facebook, Instagram, Pinterest, Youtube } from "@/components/ui/Icons";
import { CookieSettingsLink } from "@/components/common/CookieBanner";
import { Reveal } from "@/components/ui/Reveal";
import { FooterMeta } from "./FooterMeta";

// A function so links edited in Admin → Site content show up; empty links are hidden.
const social = () =>
  (
    [
      [site.social.instagram, "Instagram", Instagram],
      [site.social.youtube, "YouTube", Youtube],
      [site.social.pinterest, "Pinterest", Pinterest],
      [site.social.facebook, "Facebook", Facebook],
    ] as const
  ).filter(([href]) => !!href);

export function Footer() {
  return (
    <footer className="on-dark relative overflow-hidden bg-espresso pb-24 text-cream md:pb-0">
      {/* Letters + links */}
      <div className="container-site grid gap-14 pt-16 md:grid-cols-12 md:pt-20">
        <div className="md:col-span-5">
          <h2 className="display-md max-w-sm">
            Letters from <span className="text-ochre">the studio</span>
          </h2>
          <p className="mt-4 max-w-sm text-[14px] leading-[1.75] text-cream/70">New pieces, early access and the odd story from the cutting table. Plus 10% off your first order.</p>
          <NewsletterForm light source="footer" className="mt-7 max-w-md" />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-7 md:pl-8">
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h3 className="eyebrow mb-4 text-ochre">{title}</h3>
              <ul className="md:space-y-1">
                {links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="link-u inline-block py-2.5 text-[13.5px] font-medium text-cream/75 transition-colors hover:text-cream md:py-1">
                      {l}
                    </Link>
                  </li>
                ))}
                {title === "Legal" && (
                  <li>
                    <CookieSettingsLink className="link-u inline-block py-2.5 text-[13.5px] font-medium text-cream/75 transition-colors hover:text-cream md:py-1" />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Care, payments, social */}
      <div className="container-site mt-14 flex flex-col gap-8 border-y border-line-dark py-8 text-[13px] md:flex-row md:items-center md:justify-between">
        <p className="leading-relaxed text-cream/80">
          <a href={`mailto:${site.email}`} className="link-u hit hover:text-cream">
            {site.email}
          </a>
          <span aria-hidden className="mx-2 text-cream/40">
            /
          </span>
          <a href={site.whatsappHref} className="link-u hit hover:text-cream" target="_blank" rel="noopener noreferrer">
            WhatsApp {site.whatsapp}
          </a>
          <span className="block text-cream/55">{site.hours}</span>
        </p>
        <PaymentBadges light />
        <ul className="flex gap-2">
          {social().map(([href, label, Icon]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Threads Ware on ${label}`} className="grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream transition-colors duration-300 hover:bg-ochre hover:text-ink">
                <Icon size={16} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Sign */}
      <div className="container-site overflow-hidden pt-12 md:pt-16">
        <Reveal>
          <p aria-hidden className="sign-word select-none text-balance text-center text-[clamp(2.6rem,8.2vw,9.4rem)] md:whitespace-nowrap">
            Made to be worn
          </p>
        </Reveal>
      </div>

      <div className="container-site flex flex-col items-start justify-between gap-5 border-t border-line-dark py-7 md:flex-row md:items-center">
        <Wordmark compact className="text-cream" />
        <p className="text-[11.5px] font-medium tracking-wide text-cream/55">
          © {new Date().getFullYear()} THREADS WARE. GSTIN {site.gstin}.
        </p>
        <FooterMeta />
      </div>
    </footer>
  );
}
