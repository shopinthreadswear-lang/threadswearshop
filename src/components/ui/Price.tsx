import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Price({ price, compareAt, className, size = "sm" }: { price: number; compareAt?: number; className?: string; size?: "sm" | "lg" }) {
  const off = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2.5", size === "lg" ? "text-[20px]" : "text-[13.5px]", className)}>
      <span className={cn(compareAt && "text-error")}>{formatINR(price)}</span>
      {compareAt && (
        <>
          <s className="text-faint" aria-label={`Was ${formatINR(compareAt)}`}>
            {formatINR(compareAt)}
          </s>
          <span className={cn("tracking-wide text-error", size === "lg" ? "text-[13px]" : "text-[11.5px]")}>{off}% off</span>
        </>
      )}
    </span>
  );
}
