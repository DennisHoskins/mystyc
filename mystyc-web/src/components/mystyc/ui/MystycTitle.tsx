import React from "react";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function MystycTitle({ 
  icon, 
  heading = "", 
  title = "", 
  titleIcon,
  subtitle = "" 
} : {
  icon: React.ReactNode,
  heading?: string,
  title?: string,
  titleIcon?: React.ReactNode | null;
  subtitle?: string
}) {
  return(
    <div className="flex-1 flex items-center space-x-1">
      {icon}
      <Heading level={1} className="!text-4xl">{heading}</Heading>
      <div className="flex space-x-2 items-center">
        <div className="flex flex-col !space-y-0 border-l border-gray-700 pl-4 ml-3">
          <Text variant="body" className="!text-gray-400 flex space-x-2 items-center">{titleIcon}{title}</Text>
          <Text variant="muted" className="!text-gray-500 !mt-1">{subtitle}</Text>
        </div>
      </div>
    </div>
  );
}