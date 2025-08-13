import { formatStringForDisplay } from "@/util/util";
import Link from "./Link";

interface CapsuleProps {
  icon?: React.ReactNode | null,
  label: string;
  href?: string;
}

export default function Capsule({ icon, label, href } : CapsuleProps) {
  if (!label) {
    return null;
  }

  const className = 'p-1 pr-2 rounded-full bg-gray-300 !text-gray-600 font-bold text-[8px] max-w-fit flex items-center ' + (icon ? "pl-1" : "pl-2");

  return(
    href ? (
        <Link href={href} className={className}>
          {icon && <span className="mr-1">{icon}</span>}
          {formatStringForDisplay(label)}
        </Link>
      ) : (
        <div className={className}>
          {icon && <span className="mr-1">{icon}</span>}
          {formatStringForDisplay(label)}
        </div>
      )
  );
}