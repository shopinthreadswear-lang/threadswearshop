import Link from "next/link";
import { Wordmark } from "@/components/ui/Logo";
import { Lock } from "@/components/ui/Icons";
import { site } from "@/lib/site";

/** Distraction-free checkout chrome: logo, security cue and help — nothing else. */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line bg-ivory">
        <div className="container-site grid h-[72px] grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/bag" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted hover:text-ink">
            ← <span className="hidden sm:inline">Back to Bag</span>
          </Link>
          <Link href="/" aria-label="Threads Ware — home">
            <Wordmark compact />
          </Link>
          <p className="flex items-center justify-end gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
            <Lock size={13} /> <span className="hidden sm:inline">Secure Checkout</span>
          </p>
        </div>
      </header>
      <main id="main" className="container-site min-h-[70vh] py-8 md:py-12">
        {children}
      </main>
      <footer className="border-t border-line py-8">
        <div className="container-site flex flex-col items-center justify-between gap-3 text-[12px] text-muted md:flex-row">
          <p>
            Need help? <a href={site.whatsappHref} className="link-static text-ink" target="_blank" rel="noopener noreferrer">WhatsApp {site.whatsapp}</a> · <a href={`mailto:${site.email}`} className="link-static text-ink">{site.email}</a>
          </p>
          <nav className="flex gap-5">
            <Link href="/shipping" className="hover:text-ink">Shipping</Link>
            <Link href="/returns" className="hover:text-ink">Returns</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
