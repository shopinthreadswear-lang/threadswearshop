import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { PaymentBadges } from "@/components/common/PaymentBadges";
import { Facebook, Instagram, Pinterest, Youtube } from "@/components/ui/Icons";
import { CookieSettingsLink } from "@/components/common/CookieBanner";
import { FooterMeta } from "./FooterMeta";

const SOCIAL = [
  [site.social.instagram, "Instagram", Instagram],
  [site.social.youtube, "YouTube", Youtube],
  [site.social.pinterest, "Pinterest", Pinterest],
  [site.social.facebook, "Facebook", Facebook],
] as const;

export function Footer() {
  return (
    <footer className="border-t border-line bg-ivory pb-24 text-ink md:pb-0">
      <div className="container-site grid gap-12 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-4">
          <Wordmark />
          <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">Shirts, T-shirts, knitwear and tailoring, designed in Mumbai and made to be worn for years.</p>
          <p className="mt-6 text-[13.5px] leading-relaxed text-charcoal">
            <a href={`mailto:${site.email}`} className="link-u hit hover:text-ink">
              {site.email}
            </a>
            <br />
            <a href={site.whatsappHref} className="link-u hit hover:text-ink" target="_blank" rel="noopener noreferrer">
              WhatsApp {site.whatsapp}
            </a>
            <br />
            <span className="text-muted">{site.hours}</span>
          </p>
          <ul className="mt-5 flex gap-1">
            {SOCIAL.map(([href, label, Icon]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Threads Wear on ${label}`} className="-ml-2 mr-2 grid h-11 w-11 place-items-center text-charcoal transition-colors hover:text-denim">
                  <Icon size={17} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-8 md:pl-6">
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-[14px] font-medium">{title}</h3>
              <ul>
                {links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="inline-block py-2 text-[13.5px] text-muted transition-colors hover:text-ink md:py-1">
                      {l}
                    </Link>
                  </li>
                ))}
                {title === "Legal" && (
                  <li>
                    <CookieSettingsLink className="inline-block py-2 text-[13.5px] text-muted transition-colors hover:text-ink md:py-1" />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-line bg-paper">
        <div className="container-site grid items-center gap-5 py-8 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-[20px] font-medium">Join the list</h2>
            <p className="mt-1 text-[13.5px] text-muted">New pieces, early access and 10% off your first order.</p>
          </div>
          <NewsletterForm source="footer" className="md:ml-auto md:w-full md:max-w-md" />
        </div>
      </div>

      <div className="container-site flex flex-col items-start justify-between gap-5 border-t border-line py-6 lg:flex-row lg:items-center">
        <p className="text-[12.5px] text-muted">
          © {new Date().getFullYear()} THREADS WEAR. GSTIN {site.gstin}.
        </p>
        <PaymentBadges />
        <FooterMeta />
      </div>
    </footer>
  );
}
