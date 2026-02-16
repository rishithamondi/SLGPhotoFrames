import { cn } from "@/lib/utils";

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl overflow-hidden border border-border/50",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="aspect-[4/5] bg-muted animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
          <div className="h-5 bg-muted rounded animate-pulse w-20" />
        </div>
        <div className="h-9 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
