import PageTransition from "@/components/ui/transition/PageTransition";
import MystycTitle from "../../ui/MystycTitle";
import { BookHeart } from "lucide-react";
import AstrologyLinkPanel from "./AstrologyLinkPanel";

export default function AstrologyPage() {
  return (
    <PageTransition>
      <div className='w-full h-full flex flex-col'>
        <MystycTitle
          icon={<BookHeart strokeWidth={1.5} className='w-10 h-10 text-white' />}
          heading='Astrology'
          title='Reference Library'
          subtitle='Cosmic knowledge database'
        />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AstrologyLinkPanel sign='Aquarius' label='The Water Bearer' sublabel='January 21 - February 19' />
          <AstrologyLinkPanel sign='Aries' label='The Ram' sublabel='March 21 - April 20' />
          <AstrologyLinkPanel sign='Cancer' label='The Crab' sublabel='June 22 - July 23' />
          <AstrologyLinkPanel sign='Capricorn' label='The Goat' sublabel='December 22 - January 20' />
          <AstrologyLinkPanel sign='Gemini' label='The Twins' sublabel='May 22 - June 21' />
          <AstrologyLinkPanel sign='Leo' label='The Lion' sublabel='July 24 - August 23' />
          <AstrologyLinkPanel sign='Libra' label='The Scales' sublabel='September 24 - October 23' />
          <AstrologyLinkPanel sign='Pisces' label='The Fish' sublabel='February 20 - March 20' />
          <AstrologyLinkPanel sign='Sagittarius' label='The Archer' sublabel='November 23 - December 21' />
          <AstrologyLinkPanel sign='Scorpio' label='The Scorpion' sublabel='October 24 - November 22' />
          <AstrologyLinkPanel sign='Taurus' label='The Bull' sublabel='April 21 - May 21' />
          <AstrologyLinkPanel sign='Virgo' label='The Virgin' sublabel='August 24 - September 23' />
        </div>
      </div>
    </PageTransition>
  );
}