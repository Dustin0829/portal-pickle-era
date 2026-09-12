import { Link } from "react-router-dom";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="Pickle Era">
      <img
        src="/logo.png"
        alt="Pickle Era"
        className={className ?? "h-8 w-auto sm:h-10"}
      />
    </Link>
  );
}
