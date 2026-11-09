import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ScrollThread } from "@/components/motion/Scroll";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollThread />
      <Header />
      <main id="main" className="pt-[var(--hdr)] [--hdr:100px] md:[--hdr:114px]">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </>
  );
}
