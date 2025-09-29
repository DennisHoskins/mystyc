import { Horoscope } from "mystyc-common";
import InsightsStarPanel from "./InsightsStarPanel";

export default function InsightsStarsPanel({ insights } : { insights: Horoscope | null }) {
  return (
    <div className='grid grid-cols-5 gap-2'>
      <InsightsStarPanel planet='Sun' data={insights?.cosmicChart.sun} />
      <InsightsStarPanel planet='Moon' data={insights?.cosmicChart.moon} />
      <InsightsStarPanel planet='Rising' data={insights?.cosmicChart.rising} />
      <InsightsStarPanel planet='Venus' data={insights?.cosmicChart.venus} />
      <InsightsStarPanel planet='Mars' data={insights?.cosmicChart.mars} />
    </div>
  );
}