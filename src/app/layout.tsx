import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { SizeGuideModal } from "@/components/common/SizeGuide";
import { Toaster } from "@/components/ui/Toaster";
import { CookieBanner } from "@/components/common/CookieBanner";
import { NewsletterPopup } from "@/components/common/NewsletterPopup";
import { Loader } from "@/components/common/Loader";
import { Analytics } from "@/components/common/Analytics";
import { RouteEffects } from "@/components/common/RouteEffects";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CursorLabel } from "@/components/motion/CursorLabel";
import { JsonLd } from "@/components/ui/JsonLd";
import { absoluteUrl, site } from "@/lib/site";
import { IMG } from "@/data/images";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz", "wdth"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "THREADS WARE — The New Standard of Menswear", template: "%s | Threads Ware" },
  description: site.description,
  applicationName: site.shortName,
  keywords: ["premium menswear India", "luxury men's clothing", "men's shirts", "heavyweight t-shirts", "men's tailoring", "Threads Ware"],
  alternates: { canonical: site.url },
  openGraph: {
    type: "website",
    siteName: site.shortName,
    locale: "en_IN",
    url: site.url,
    title: "THREADS WARE — The New Standard of Menswear",
    description: site.description,
    images: [{ url: `${IMG.heroSuit}?w=1200&h=630&fit=crop&auto=format&q=75`, width: 1200, height: 630, alt: "Threads Ware campaign" }],
  },
  twitter: { card: "summary_large_image", site: "@threadsware" },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ebe05c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:bg-ink focus:px-4 focus:py-3 focus:text-ivory">
          Skip to content
        </a>
        <Providers>
          {children}
          <CartDrawer />
          <SearchOverlay />
          <SizeGuideModal />
          <Toaster />
          <CookieBanner />
          <NewsletterPopup />
          <RouteEffects />
          <SmoothScroll />
          <CursorLabel />
          <Analytics />
          <Loader />
        </Providers>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": absoluteUrl("/#organization"),
                name: site.shortName,
                url: site.url,
                logo: absoluteUrl("/icon.svg"),
                email: site.email,
                sameAs: Object.values(site.social),
                contactPoint: [{ "@type": "ContactPoint", contactType: "customer service", email: site.email, telephone: site.phone, areaServed: "IN", availableLanguage: ["English", "Hindi"] }],
                address: { "@type": "PostalAddress", streetAddress: `${site.address.line1}, ${site.address.line2}`, addressLocality: site.address.city, addressRegion: site.address.state, postalCode: site.address.pincode, addressCountry: "IN" },
              },
              {
                "@type": "WebSite",
                "@id": absoluteUrl("/#website"),
                url: site.url,
                name: site.shortName,
                publisher: { "@id": absoluteUrl("/#organization") },
                potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/search?q={search_term_string}") }, "query-input": "required name=search_term_string" },
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
