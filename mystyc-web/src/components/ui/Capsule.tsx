import { formatStringForDisplay } from "@/util/util";
import Link from "./Link";

interface CapsuleProps {
  icon?: React.ReactNode | null,
  label: string;
  total?: number | string | null;
  hasTotal?: boolean;
  href?: string;
  className?: string;
}

export default function Capsule({ icon, label, total, hasTotal = false, href, className } : CapsuleProps) {
  if (!label) {
    return null;
  }

  const cls = 'py-[2.5px] pl-1 pr-2 rounded-full bg-blue-600 !text-gray-100 font-bold text-[10px] flex whitespace-nowrap items-center ' + (icon ? "pl-1" : "pl-2") + " " + className;

  return(
    href ? (
        <Link href={href} className={`flex ${cls}`}>
          {icon && <span className="block ml-1 mr-1">{icon}</span>}
          <span className="block">{formatStringForDisplay(label)}</span>
          {hasTotal && <span className="block w-4 text-center">{total}</span>}
        </Link>
      ) : (
        <div className={`flex ${cls}`}>
          {icon && <span className="block ml-1 mr-1">{icon}</span>}
          <span className="block">{formatStringForDisplay(label)}</span>
          {hasTotal && <span className="block w-4 text-center">{total}</span>}
        </div>
      )
  );
}