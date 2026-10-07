import Image from "next/image";
import { IMG } from "@/data/images";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden bg-night lg:block">
        <Image src={IMG.manPortraitKnit} alt="" fill sizes="50vw" className="img-grade object-cover opacity-85" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-sm text-ivory">
          <p className="eyebrow text-champagne-soft">Members</p>
          <p className="display-md mt-4">Designed with intention. Worn without effort.</p>
          <ul className="mt-6 space-y-1.5 text-[13.5px] text-ivory/75">
            <li>— Track orders and request returns in a tap</li>
            <li>— A wishlist that follows you across devices</li>
            <li>— Early access to limited releases</li>
          </ul>
        </div>
      </div>
      <div className="flex items-center justify-center px-[var(--spacing-gutter)] py-14 md:py-20">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
