import { Link } from "react-router-dom";

// The logo file is JPG with a white background, so on espresso it sits on a white badge.
// Never crop, recolour or redraw it.
export function LogoBadge({ className = "h-12" }: { className?: string }) {
  return (
    <Link to="/" className="inline-flex rounded-md bg-white p-1.5">
      <img src="/logo.jpg" alt="VSS Hair" className={`w-auto ${className}`} />
    </Link>
  );
}