import { Link } from "react-router-dom";

// default height: a tall logo needs more room
export function LogoBadge({ className = "h-16" }: { className?: string }) {
  return (
    <Link to="/" className="inline-flex rounded-md bg-white p-1.5">
      {/* width and height are the file's real size, so the page does not jump while it loads */}
      <img src="/logo.jpg" alt="VSS Hair" width={720} height={1096} className={`w-auto ${className}`} />
    </Link>
  );
}