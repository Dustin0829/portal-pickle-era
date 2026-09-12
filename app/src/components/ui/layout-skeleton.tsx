import {
  Skeleton as BoneyardSkeleton,
  configureBoneyard,
  type SkeletonProps,
} from "boneyard-js/react";

configureBoneyard({
  animate: "pulse",
  boneClass: "rounded-xl",
});

export type LayoutSkeletonProps = SkeletonProps & {
  /** Exposed on the loading wrapper for screen readers. */
  ariaLabel?: string;
};

export function LayoutSkeleton({
  ariaLabel,
  loading,
  className,
  fallback = (
    <div
      className="bg-muted/50 min-h-8 w-full animate-pulse rounded-xl"
      aria-hidden
    />
  ),
  ...props
}: LayoutSkeletonProps) {
  return (
    <div
      aria-busy={loading || undefined}
      aria-label={loading ? ariaLabel : undefined}
      className={className}
    >
      <BoneyardSkeleton loading={loading} fallback={fallback} {...props} />
    </div>
  );
}
