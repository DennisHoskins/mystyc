// import { createInteractionKey } from 'mystyc-common/schemas';
import { AstrologyCalculated } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
// import Link from '@/components/ui/Link';
// import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';

interface UserCoreIdentityInteractionProps {
  interactionKey: string;
  sign1: string | undefined;
  sign2: string | undefined;
  astrologyData: AstrologyCalculated;
  label: React.ReactNode;
}

export default function UserCoreIdentityInteraction({
  // interactionKey,
  sign1,
  sign2,
  // astrologyData,
  label
}: UserCoreIdentityInteractionProps) {
  if (!sign1 || !sign2) {
    return (
      <Panel padding={4}>
        <AdminDetailField label={label} heading="Not set" text="" />
      </Panel>
    );
  }

  return (
    <>TODO</>
  );

  // const planetInteraction = astrologyData.interactions.planets[interactionKey];
  
  // if (!planetInteraction) {
  //   return (
  //     <Panel padding={4}>
  //       <AdminDetailField 
  //         label={label} 
  //         heading={`${sign1}-${sign2}`} 
  //         text="Interaction data not found" 
  //       />
  //     </Panel>
  //   );
  // }

  // // Get the element and modality interactions
  // const sign1Data = astrologyData.planetaryData[interactionKey.split('-')[0] as keyof typeof astrologyData.planetaryData];
  // const sign2Data = astrologyData.planetaryData[interactionKey.split('-')[1] as keyof typeof astrologyData.planetaryData];
  
  // if (!sign1Data || !sign2Data) {
  //   return (
  //     <Panel padding={4}>
  //       <AdminDetailField 
  //         label={label} 
  //         heading={`${sign1}-${sign2}`} 
  //         text="Sign data not found" 
  //       />
  //     </Panel>
  //   );
  // }

  // const elementKey = createInteractionKey(sign1Data.signInfo.element, sign2Data.signInfo.element);
  // const modalityKey = createInteractionKey(sign1Data.signInfo.modality, sign2Data.signInfo.modality);
  
  // const elementInteraction = astrologyData.interactions.elements[elementKey];
  // const modalityInteraction = astrologyData.interactions.modalities[modalityKey];

  // // Build the synthesized description
  // const synthesizedText = [
  //   planetInteraction.description,
  //   elementInteraction?.description,
  //   modalityInteraction?.description
  // ].filter(Boolean).join(' ');

  // const combinedAction = [
  //   planetInteraction.action,
  //   elementInteraction?.action && `Also: ${elementInteraction.action}`
  // ].filter(Boolean).join(' ');

  // return (
  //   <Panel padding={4}>
  //     <AdminDetailField
  //       label={label}
  //       tag={
  //         <div className='flex space-x-1 items-center'>
  //           <Link href={`/admin/astrology/planet-interactions/${planetInteraction.planet1}-${planetInteraction.planet2}`}>
  //             {getDynamicIcon ? getDynamicIcon(planetInteraction.dynamic, 'w-3 h-3 text-white') : 
  //               <span className='text-[8px] text-white bg-gray-600 px-1 rounded'>{planetInteraction.dynamic}</span>}
  //           </Link>
  //         </div>
  //       }
  //       href={`/admin/astrology/planet-interactions/${planetInteraction.planet1}-${planetInteraction.planet2}`}
  //       heading={`${sign1}-${sign2}`}
  //       text={synthesizedText}
  //       subtext={combinedAction}
  //     />
  //   </Panel>
  // );
}