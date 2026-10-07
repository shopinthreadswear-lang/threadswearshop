import Link from "next/link";
import { footerNav } from "@/data/navigation";
import { site } from "@/lib/site";
import { Wordmark, Monogram } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { PaymentBadges } from "@/components/common/PaymentBadges";
import { Facebook, Instagram, Lock, Pinterest, Shield, Youtube } from "@/components/ui/Icons";
import { CookieSettingsLink } from "@/components/common/CookieBanner";
import { FooterMeta } from "./FooterMeta";

export function Footer() {
  return (
    <footer className="on-dark bg-night pb-24 text-ivory md:pb-0">
      <div className="container-site grid gap-14 border-b border-line-dark py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-5">
          <Monogram size={52} className="mb-8 text-champagne-soft" />
          <h2 className="display-md max-w-md">Private access, delivered.</h2>
          <p className="mt-4 max-w-sm text-[14px] text-ivory/60">New collections, early releases and editorial stories — straight to your inbox. And 10% off your first order.</p>
          <NewsletterForm light source="footer" className="mt-8 max-w-md" />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 md:col-span-7 md:pl-8">
          {Object.entries(footerNav).map(([title, links]) => (
            <div key={title}>
              <h3 className="eyebrow mb-5 text-[10.5px] text-champagne-soft">{title}</h3>
              <ul className="space-y-1.5">
                {links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="inline-block py-1 text-[13.5px] text-ivory/70 transition-colors hover:text-ivory link-u">
                      {l}
                    </Link>
                  </li>
                ))}
                {title === "Legal" && (
                  <li>
                    <CookieSettingsLink className="text-[13.5px] text-ivory/70 transition-colors hover:text-ivory link-u" />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container-site grid gap-10 border-b border-line-dark py-12 md:grid-cols-3">
        <div>
          <h3 className="eyebrow mb-4 text-[10.5px] text-champagne-soft">Customer Care</h3>
          <p className="text-[13.5px] leading-relaxed text-ivory/70">
            <a href={`mailto:${site.email}`} className="link-u hover:text-ivory">
              {site.email}
            </a>
            <br />
            <a href={site.whatsappHref} className="link-u hover:text-ivory" target="_blank" rel="noopener noreferrer">
              WhatsApp {site.whatsapp}
            </a>
            <br />
            <span className="text-ivory/45">{site.hours}</span>
          </p>
        </div>
        <div>
          <h3 className="eyebrow mb-4 text-[10.5px] text-champagne-soft">Shop with Confidence</h3>
          <ul className="space-y-2 text-[13px] text-ivory/70">
            <li className="flex items-center gap-2.5">
              <Lock size={14} /> 256-bit encrypted checkout
            </li>
            <li className="flex items-center gap-2.5">
              <Shield size={15} /> Authentic, quality-inspected pieces
            </li>
          </ul>
          <PaymentBadges light className="mt-5" />
        </div>
        <div>
          <h3 className="eyebrow mb-4 text-[10.5px] text-champagne-soft">Follow</h3>
          <ul className="flex gap-2">
            {[
              [site.social.instagram, "Instagram", Instagram],
              [site.social.youtube, "YouTube", Youtube],
              [site.social.pinterest, "Pinterest", Pinterest],
              [site.social.facebook, "Facebook", Facebook],
            ].map(([href, label, Icon]) => {
              const I = Icon as typeof Instagram;
              return (
                <li key={label as string}>
                  <a href={href as string} target="_blank" rel="noopener noreferrer" aria-label={`Threads Ware on ${label}`} className="grid h-11 w-11 place-items-center border border-line-dark text-ivory/80 transition-colors hover:border-ivory hover:text-ivory">
                    <I />
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-[12.5px] text-ivory/50">
            Ship to: <span className="text-ivory/80">India / INR ₹</span>
          </p>
        </div>
      </div>

      <div className="container-site py-10">
        <p className="max-w-3xl font-serif text-[clamp(1.6rem,3vw,2.6rem)] leading-tight text-ivory/90">Shirts, T-shirts, knitwear and tailoring — designed in Mumbai, made to be worn for years.</p>
      </div>
      <div className="container-site flex flex-col items-start justify-between gap-6 border-t border-line-dark py-8 md:flex-row md:items-center">
        <Wordmark compact className="text-ivory/90" />
        <p className="text-[11.5px] tracking-wide text-ivory/45">
          © {new Date().getFullYear()} THREADS WARE. GSTIN {site.gstin}.
        </p>
        <FooterMeta />
      </div>
    </footer>
  );
}
