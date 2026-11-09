import { SizeGuideContent } from "@/components/common/SizeGuide";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Size Guide", description: "Threads Ware size guide for T-shirts, shirts, knitwear, outerwear and tailoring — measurements in centimetres and inches, with how-to-measure advice.", path: "/size-guide" });

export default function SizeGuidePage() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Size Guide" }]} className="mb-8" />
      <div className="grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="eyebrow text-muted">Fit & Sizing</p>
          <h1 className="display-lg mt-4">Size Guide</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-muted">Measurements are of the garment laid flat, in centimetres or inches. Each product page also shows the model’s height and size, and our fit notes.</p>
          <p className="mt-5 text-[13.5px] text-muted">Between sizes? For Regular and Slim fits choose the larger size; for Relaxed and Oversized fits, choose the smaller.</p>
        </header>
        <div className="lg:col-span-8">
          <SizeGuideContent showAll />
        </div>
      </div>
    </div>
  );
}
