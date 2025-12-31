import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border overflow-hidden",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="aspect-square bg-muted animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        
        {/* Price */}
        <div className="h-6 bg-muted rounded animate-pulse w-1/4 mt-4" />
        
        {/* Button */}
        <div className="h-10 bg-muted rounded-lg animate-pulse w-full mt-4" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className={`animation-delay-${(i + 1) * 100}`} />
      ))}
    </div>
  );
}
