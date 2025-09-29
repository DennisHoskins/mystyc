import { AstrologyCalculated } from "mystyc-common";
import ProfileStarPanel from "./ProfileStarPanel";

export default function ProfileStarsPanel({ astrology } : { astrology: AstrologyCalculated | undefined }) {
  return (
    <div className='grid grid-cols-5 gap-2'>
      <ProfileStarPanel planet='Sun' data={astrology?.sun} />
      <ProfileStarPanel planet='Moon' data={astrology?.moon} />
      <ProfileStarPanel planet='Rising' data={astrology?.rising} />
      <ProfileStarPanel planet='Venus' data={astrology?.venus} />
      <ProfileStarPanel planet='Mars' data={astrology?.mars} />
    </div>
  );
}