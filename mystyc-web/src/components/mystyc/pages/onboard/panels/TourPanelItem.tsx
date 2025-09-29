import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function TourPanelItem({ label, icon, text } : { label: string, icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center">
      <div className="mr-4 border border-white !border-opacity-15 bg-[#23053729] rounded-md items-center justify-center h-16 aspect-square hidden md:flex">
        {icon}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="scale-[0.5] -mt-1 -ml-2 md:hidden">{icon}</div>
          <Heading level={4} color='text-gray-100' className="text-left">{label}</Heading>
        </div>
        <Text variant="small" color='text-gray-400' className="text-left hidden md:block">{text}</Text>
        <Text variant="xs" color='text-gray-400' className="-mt-1 text-left md:hidden">{text}</Text>
      </div>
    </div>
  )
}