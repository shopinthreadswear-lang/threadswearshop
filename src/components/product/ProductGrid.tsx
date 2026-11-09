import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function ProductGrid({ products, cols = 4, className }: { products: Product[]; cols?: 2 | 3 | 4; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14", cols === 2 && "lg:grid-cols-2", cols === 3 && "md:grid-cols-3", cols === 4 && "md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} delay={(i % 4) * 90}>
          <ProductCard productId={p.id} priority={i < 4} sizes={cols === 2 ? "50vw" : cols === 3 ? "(max-width:768px) 50vw, 33vw" : "(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"} />
        </Reveal>
      ))}
    </ul>
  );
}
