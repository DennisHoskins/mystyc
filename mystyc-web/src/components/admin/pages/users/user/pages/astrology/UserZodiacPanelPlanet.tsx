// import { PlanetType, AstrologyCalculated, PlanetaryData } from 'mystyc-common';
import { PlanetType, PlanetaryData } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
// import { getElementIcon } from '@/components/ui/icons/astrology/elements';
// import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
// import Energy from '@/components/ui/icons/astrology/Energy';
// import Link from '@/components/ui/Link';
// import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

interface UserZodiacPanelPlanetProps {
  planet: PlanetType;
  planetData: PlanetaryData;
  icon: React.ReactNode;
  label: string;
}

export default function UserZodiacPanelPlanet({ 
  planet, 
  planetData,
  icon, 
  label 
}: UserZodiacPanelPlanetProps) {
  if (!planetData) {
    return (
      <Panel padding={4}>
        <AdminDetailField
          label={
            <div className='text-[11px] text-gray-500 flex flex-1 items-center'>
              {icon}
              <span className='ml-1'>{label}</span>
            </div>
          }
          value="Not set"
          text=""
        />
      </Panel>
    );
  }

  return(
    <>TODO {planet}</>
  );

  // const { sign, position, signInfo } = planetData;

  // return (
  //   <Panel padding={4}>
  //     <AdminDetailField
  //       label={
  //         <div className='text-[11px] text-gray-500 flex flex-1 items-center'>
  //           {icon}
  //           <span className='ml-1'>{label}</span>
  //         </div>
  //       }
  //       tag={
  //         <div className='flex space-x-1 items-center'>
  //           <Link href={`/admin/astrology/elements/${signInfo.element}`}>
  //             {getElementIcon(signInfo.element, 'w-3 h-3 text-white')}
  //           </Link>
  //           <Link href={`/admin/astrology/modalities/${signInfo.modality}`}>
  //             {getModalityIcon(signInfo.modality, 'w-3 h-3 text-white')}
  //           </Link>
  //           <Link href={`/admin/astrology/energy-types/${position.energyType}`}>
  //             <Energy size={3} />
  //           </Link>
  //         </div>
  //       }
  //       href={`/admin/astrology/planetary-positions/planetary-position/${planet}/${sign}`}
  //       value={
  //         <div className='flex items-center space-x-1 py-1'>
  //           {getZodiacIcon(sign, 'w-3 h-3')}
  //           <span className='text-gray-100'>{sign}</span>
  //         </div>
  //       }
  //       text={position.description}
  //     />
  //   </Panel>
  // );
}