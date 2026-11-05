import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="pt-[var(--hdr)] [--hdr:64px] md:[--hdr:76px]">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
