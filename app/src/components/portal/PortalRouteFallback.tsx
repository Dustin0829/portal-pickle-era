/** Keeps portal chrome mounted while a lazy page chunk loads. */
export function PortalRouteFallback() {
  return (
    <div
      className="min-h-full bg-transparent"
      aria-busy="true"
      aria-label="Loading page"
    />
  );
}
