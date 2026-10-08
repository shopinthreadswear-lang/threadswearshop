import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { IMG } from "@/data/images";
import { ArrowRight } from "@/components/ui/Icons";

export const metadata = { title: "Page Not Found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="pt-[var(--hdr)] [--hdr:100px] md:[--hdr:114px]">
        <section className="container-site grid min-h-[72vh] items-center gap-12 py-16 md:grid-cols-2">
          <div>
            <p className="eyebrow text-muted">Error 404</p>
            <h1 className="display-lg mt-5">This look isn’t available.</h1>
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-muted">The page you’re looking for seems to have moved. Let us take you somewhere better.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="btn btn-primary">
                <span>Return Home</span> <ArrowRight className="btn-arrow" size={15} />
              </Link>
              <Link href="/new-arrivals" className="btn btn-outline">Shop New Arrivals</Link>
            </div>
            <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-4 text-[13px] text-muted">
              {[["Best Sellers", "/best-sellers"], ["Collections", "/collections"], ["Track Order", "/track-order"], ["Contact", "/contact"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="link-u hit hover:text-ink">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden bg-bone">
            <Image src={IMG.rackDark} alt="" fill sizes="50vw" className="img-grade object-cover" />
            <span className="absolute bottom-6 right-6 font-serif text-[120px] leading-none text-cream/90">404</span>
          </div>
        </section>
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
