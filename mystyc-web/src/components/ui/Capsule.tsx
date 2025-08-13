import { formatStringForDisplay } from "@/util/util";
import Link from "./Link";

interface CapsuleProps {
  icon?: React.ReactNode | null,
  label: string;
  total?: number | string | null;
  hasTotal?: boolean;
  href?: string;
}

export default function Capsule({ icon, label, total, hasTotal, href } : CapsuleProps) {
  if (!label) {
    return null;
  }

  const className = 'p-1 pr-2 rounded-full bg-gray-300 !text-gray-600 font-bold text-[8px] max-w-fit flex items-center ' + (icon ? "pl-1" : "pl-2");

  return(
    href ? (
        <Link href={href} className={`flex ${className}`}>
          <span className="block ml-1 mr-1">{icon}</span>
          <span className="block">{formatStringForDisplay(label)}</span>
          {hasTotal && <span className="block w-4 text-center">{total}</span>}
        </Link>
      ) : (
        <div className={`flex ${className}`}>
          <span className="block ml-1 mr-1">{icon}</span>
          <span className="block">{formatStringForDisplay(label)}</span>
          {hasTotal && <span className="block w-4 text-center">{total}</span>}
        </div>
      )
  );
}