import React from "react";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Link from "@/components/ui/Link";
import Panel from "@/components/ui/Panel";

export default function MystycTitle({ 
  icon, 
  heading = "", 
  href = "",
  title = "", 
  titleIcon,
  subtitle = "" 
} : {
  icon?: React.ReactNode,
  heading?: string,
  href?: string,
  title?: string,
  titleIcon?: React.ReactNode | null;
  subtitle?: string
}) {
  return(
    <div className="border border-[var(--color-border)] md:border-none overflow-hidden
                    rounded-sm backdrop-blur-md md:backdrop-blur-none bg-[var(--color-main)] md:bg-transparent p-4 md:p-0 flex">

      <Panel className="max-w-14 min-w-14 mr-2 items-center justify-center !p-0 md:hidden">
        {icon}
      </Panel>

      <div className="ml-1 flex-1 flex flex-col md:flex-row items-center space-x-1 md:max-h-10 overflow-hidden">
        
        <div className="overflow-hidden max-w-3xl flex w-full md:w-auto items-center">
          <div className="hidden md:block md:mr-2">{icon}</div>
          {href ? (
            <Link href={href} className="hover:!no-underline truncate">
              <Heading level={1} className="!text-4xl">{heading}</Heading>
            </Link>
          ) : (
            <Heading level={1} className="!text-2xl md:!text-4xl truncate">{heading}</Heading>
          )}
        </div>

        <div className="flex space-x-2 items-center w-full md:w-auto">
          <div className="flex flex-col !space-y-0  md:border-l md:border-gray-700 md:pl-4 md:ml-3 overflow-hidden">
            <Text variant="body" color='text-gray-300' className="flex space-x-2 items-center">{titleIcon}{title}</Text>
            <Text variant="muted" color='text-gray-500' className="!mt-1 truncate">{subtitle}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}